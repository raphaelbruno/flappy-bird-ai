class Brain {
  constructor(inputs, hiddens, outputs) {
    this.generation = 1;
    this.amountInputs = inputs;
    this.amountHiddens = hiddens;
    this.amountOutputs = outputs;
    this.weights = [];
    this.model = null;

    this.build();
  }

  clone() {
    return tf.tidy(() => {
      let brain = new Brain(this.amountInputs, this.amountHiddens, this.amountOutputs);
      let weights = [];
      for (let weight of this.model.getWeights())
        weights.push(weight.clone());

      brain.model.setWeights(weights);
      return brain;
    });
  }

  dispose() {
    this.model.dispose();
  }
  
  setWeights(weights) {
    tf.tidy(() => {
      let newWeights = [];
      for (let tensor of weights) {
        newWeights.push(tf.tensor(Object.values(tensor.values), tensor.shape));
      }
      this.model.setWeights(newWeights);
    });
    this.fillWeights();
  }
  
  mutate(rate) {
    tf.tidy(() => {
      let mutatedWeights = [];
      for (let tensor of this.model.getWeights()) {
        let values = tensor.dataSync().slice();
        for (let i = 0; i < values.length; i++) {
          if (random(1) < rate) {
            values[i] += randomGaussian();
          }
        }

        mutatedWeights.push(tf.tensor(values, tensor.shape));
      }
      this.model.setWeights(mutatedWeights);
    });
    this.fillWeights();
  }

  build() {
    let hidden = tf.layers.dense({
      units: this.amountHiddens,
      inputShape: [this.amountInputs],
      activation: 'sigmoid'
    });

    let output = tf.layers.dense({
      units: this.amountOutputs,
      activation: 'softmax'
    });

    this.model = tf.sequential();
    this.model.add(hidden);
    this.model.add(output);

    this.fillWeights();
  }

  fillWeights() {
    this.weights = [];

    for (let tensor of this.model.getWeights()) {
      this.weights.push({
        values: tensor.dataSync().slice(),
        shape: tensor.shape
      });
    }
  }

  predict(inputs) {
    return tf.tidy(() => {
      let tensor = tf.tensor2d([inputs]);
      let predict = this.model.predict(tensor);
      return predict.dataSync();
    });
  }

  serialize() {
    let object = {
      generation: this.generation,
      amountInputs: this.amountInputs,
      amountHiddens: this.amountHiddens,
      amountOutputs: this.amountOutputs,
      weights: this.weights,
      model: this.model
    }
    return JSON.stringify(object);
  }

  static deserialize(json) {
    let brain = new Brain(json.amountInputs, json.amountHiddens, json.amountOutputs);
    brain.generation = json.generation;
    brain.setWeights(json.weights);
    return brain;
  }
}