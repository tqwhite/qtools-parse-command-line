
const commandLineProcessorGen=require('qtools-parse-command-line');

const commandLineProcessor=new commandLineProcessorGen();

const parameters=commandLineProcessor.getParameters();

console.dir(parameters);


