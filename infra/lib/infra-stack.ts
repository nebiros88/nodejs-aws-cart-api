import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nestLambda = new NodejsFunction(this, 'NestLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'src/main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
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
