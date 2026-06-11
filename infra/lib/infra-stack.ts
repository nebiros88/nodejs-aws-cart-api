import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'AuroraVpc', {
      vpcId: process.env.AWS_VPC_ID,
    });

    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      'NestLambdaSecurityGroup',
      {
        vpc,
        allowAllOutbound: true,
      },
    );

    const dbSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'AuroraDbSecurityGroup',
      process.env.AWS_PG_SECURITY_GROUP_ID ?? '',
      {
        mutable: true,
      },
    );

    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Nest Lambda to connect to Aurora PostgreSQL',
    );

    const nestLambda = new NodejsFunction(this, 'NestLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../src/main.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      bundling: {
        target: 'node20',
        format: OutputFormat.CJS,
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          'class-transformer/storage',
        ],
      },
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'),

      environment: {
        AWS_PG_HOST: process.env.AWS_PG_HOST ?? '',
        AWS_PG_PORT: process.env.AWS_PG_PORT ?? '',
        AWS_PG_USER: process.env.AWS_PG_USER ?? '',
        AWS_PG_PASSWORD: process.env.AWS_PG_PASSWORD ?? '',
        AWS_PG_DATABASE: process.env.AWS_PG_DATABASE ?? '',
      },

      vpc,
      securityGroups: [lambdaSecurityGroup],
    });

    const api = new apigwv2.HttpApi(this, 'NestHttpApi', {
      apiName: 'nodejs-aws-cart-api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowHeaders: ['*'],
      },
    });

    const integration = new integrations.HttpLambdaIntegration(
      'NestLambdaIntegration',
      nestLambda,
    );

    api.addRoutes({
      path: '/',
      methods: [apigwv2.HttpMethod.ANY],
      integration,
    });

    api.addRoutes({
      path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration,
    });

    new cdk.CfnOutput(this, 'NestApiUrl', {
      value: api.url ?? '',
    });
  }
}
