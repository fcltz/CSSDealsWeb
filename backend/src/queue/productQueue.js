const logger = require('../utils/logger');

class AsyncQueue {
  constructor() {
    this.jobs = [];
    this.isProcessing = false;
  }

  add(task) {
    this.jobs.push(task);
    this.process();
  }

  async process() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;

    try {
      // Processa até 5 requisições por vez
      while (this.jobs.length > 0) {
        const batch = this.jobs.splice(0, 5);
        await Promise.allSettled(batch.map(task => task()));
      }
    } catch (err) {
      logger.error(`Error processing queue: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}

const productQueue = new AsyncQueue();

module.exports = productQueue;
