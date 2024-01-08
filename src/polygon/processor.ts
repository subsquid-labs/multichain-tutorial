import { assertNotNull } from "@subsquid/util-internal";
import { lookupArchive } from "@subsquid/archive-registry";
import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import * as erc20abi from "../abi/erc20";

export const POLYGON_USDC_ADDRESS =
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359".toLowerCase();

export const processor = new EvmBatchProcessor()
  .setDataSource({
    // Lookup archive by the network name in Subsquid registry
    // See https://docs.subsquid.io/evm-indexing/supported-networks/
    archive: lookupArchive("polygon"),
    // Chain RPC endpoint is required for
    //  - indexing unfinalized blocks https://docs.subsquid.io/basics/unfinalized-blocks/
    //  - querying the contract state https://docs.subsquid.io/evm-indexing/query-state/
    chain: {
      // Set via .env for local runs or via secrets when deploying to Subsquid Cloud
      // https://docs.subsquid.io/deploy-squid/env-variables/
      url: "https://rpc.ankr.com/polygon",
      // More RPC connection options at https://docs.subsquid.io/evm-indexing/configuration/initialization/#set-data-source
      rateLimit: 10,
    },
  })
  .setFinalityConfirmation(75)
  .setFields({
    log: {
      transactionHash: true,
    },
  })
  .setBlockRange({
    from: 17_000_000,
  })
  .addLog({
    address: [POLYGON_USDC_ADDRESS],
    topic0: [erc20abi.events.Transfer.topic],
  });

export type Fields = EvmBatchProcessorFields<typeof processor>;
export type Context = DataHandlerContext<Store, Fields>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
