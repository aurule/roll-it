/**
 * Interface for message mention handlers
 *
 * These handlers receive a Message object. The MessageCreated event handler ensures that the message pertains
 * to Roll It in some way.
 *
 * @interface
 */
export class MentionHandler {
  /**
   * Message object we're handling
   * @type Message
   */
  message

  /**
   * Locale code from the message
   * @type string
   */
  locale

  /**
   * Determine whether this handler can handle a message reply event
   *
   * This is called in the process of choosing a handler class. It must be able to work without a handler
   * instance.
   *
   * @abstract
   * @param  {Message} message Discord message object
   * @return {boolean}         True if the handler can take the message reply, false if not.
   */
  static canHandle(message) {
    throw new Error("Function `canHandle` is not implemented")
  }

  /**
   * Create a new MentionHandler
   * @param  {Message}        message Discord message to handle
   * @return {MentionHandler}         New handler object
   */
  constructor(message) {
    this.message = message
    this.locale = message.locale
  }

  /**
   * Handle a message
   *
   * @abstract
   * @return {any} Whatever is returned by the implemented handler
   */
  async handle() {
    throw new Error("Function `handle` is not implemented")
  }

  /**
   * Send a reply to our message
   * @param  {string|MessageBuilder} message Message data to send
   * @return {Promise}                       Message reply promise
   */
  async reply(message) {
    return this.message.reply(message)
  }

  /**
   * Send a private reply to our message
   * @param  {string|MessageBuilder} message Message data to send
   * @return {Promise}                       Message reply promise
   */
  async whisper(message) {
    return this.message.whisper(message)
  }
}
