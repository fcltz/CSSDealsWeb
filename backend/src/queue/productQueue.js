const logger = require('../utils/logger');

class AsyncQueue {
  constructor() {
    this.jobs = [];
    this.isProcessing = false;
    this.idleResolvers = [];
  }

  add(task) {
    this.jobs.push(task);
    this.process();
  }

  async waitTillEmpty() {
    if (!this.isProcessing && this.jobs.length === 0) {
      return;
    }
    return new Promise(resolve => this.idleResolvers.push(resolve));
  }

  async process() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;

    try {
      // Processa até 3 requisições por vez para evitar sobrecarga de CPU e rede (download/compressão de imagem)
      while (this.jobs.length > 0) {
        const batch = this.jobs.splice(0, 3);
        await Promise.allSettled(batch.map(task => task()));
      }
    } catch (err) {
      logger.error(`Error processing queue: ${err.message}`);
    } finally {
      this.isProcessing = false;
      const resolvers = this.idleResolvers;
      this.idleResolvers = [];
      resolvers.forEach(resolve => resolve());
    }
  }
}

const productQueue = new AsyncQueue();

module.exports = productQueue;
