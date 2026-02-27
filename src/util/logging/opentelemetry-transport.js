import build from "pino-abstract-transport"
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { logs } from '@opentelemetry/api-logs';

import { toOpenTelemetry } from "./opentelemetry-mapper.js"
import version from "../../version.js";

export default async function ({ severityNumberMap, ...loggerOpts } = {}) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      'service.name': 'roll-it',
      'service.version': version,
    }),
    logRecordProcessor: new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: 'https://us.i.posthog.com/i/v1/logs',
        headers: {
          'Authorization': `Bearer ${process.env.PH_KEY}`
        }
      })
    )
  });

  sdk.start();

  const logger = logs.getLogger('my-app')

  return build(
    async function (/** @type { AsyncIterable<Bindings> } */ source) {
      const mapperOptions = {
        messageKey: source.messageKey,
        levels: source.levels,
        severityNumberMap
      }
      for await (const obj of source) {
        logger.emit(toOpenTelemetry(obj, mapperOptions))
      }
    },
    {
      async close () {
        return logger.shutdown()
      },
      expectPinoConfig: true
    }
  )
}
