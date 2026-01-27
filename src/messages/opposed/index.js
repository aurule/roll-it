import { Collection } from "discord.js"

import * as acceptedMessage from "./accepted.js"
import * as advantagesAttacker from "./advantages-attacker.js"
import * as advantagesDefender from "./advantages-defender.js"
import * as biddingAttacker from "./bidding-attacker.js"
import * as biddingDefender from "./bidding-defender.js"
import * as cancelling from "./cancelling.js"
import * as conceded from "./conceded.js"
import * as expired from "./expired.js"
import * as relented from "./relented.js"
import * as throwing from "./throwing.js"
import * as tying from "./tying.js"
import * as winning from "./winning.js"
import * as withdrawn from "./withdrawn.js"

export const messageIndex = new Collection()
export const afterRetryIndex = new Collection()
export const onReplyIndex = new Collection()

export function registerMessage(messageExports) {
  messageIndex.set(messageExports.challengeState, messageExports.messageData)
}

export function registerAfterRetry(messageExports) {
  afterRetryIndex.set(messageExports.challengeState, messageExports.afterRetry)
}

export function registerOnReplyHook(messageExports) {
  afterRetryIndex.set(messageExports.challengeState, messageExports.onReply)
}

// Register all messages and their special handlers, if needed
registerMessage(acceptedMessage)
registerMessage(advantagesAttacker)
registerMessage(advantagesDefender)
registerMessage(biddingAttacker)
registerOnReplyHook(biddingAttacker)
registerMessage(biddingDefender)
registerOnReplyHook(biddingDefender)
registerMessage(cancelling)
registerMessage(conceded)
registerMessage(expired)
registerMessage(relented)
registerMessage(throwing)
registerAfterRetry(throwing)
registerMessage(tying)
registerMessage(winning)
registerMessage(withdrawn)
