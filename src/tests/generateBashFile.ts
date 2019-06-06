//
//  this is a useful file to have if you change the templates and want to look at formatting
//
//  run it from the root with ts-node src/test/generateBashFile.ts
//
//  you have to have run npm install -g ts-node first...

import { ScriptModel } from "../scriptModel"
import { ParameterType } from "../commonModel";


const sm: ScriptModel = new ScriptModel();
//
//  add all our built in parametesr
sm.description = "this is a test script";
sm.scriptName = "test.sh";
sm.autoInstallDependencies = true;
sm.addParameter(ParameterType.Create);
sm.addParameter(ParameterType.Verify)
sm.addParameter(ParameterType.Delete)
sm.addParameter(ParameterType.Verbose)
sm.addParameter(ParameterType.InputFile)
sm.addParameter(ParameterType.Logging)


//  i'll reparse it just to make sure...
const sm1: ScriptModel = new ScriptModel();
sm1.parseBash(sm.bashScript)
// console.log(sm1.JSON)
console.log(sm1.toBash())


