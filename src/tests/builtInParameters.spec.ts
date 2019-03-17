import { ScriptModel } from "../scriptModel"
import { expect } from 'chai';
import 'mocha';
import { ParameterType, IScriptModelState, IErrorMessage } from "../commonModel";
import ParameterModel from "../ParameterModel";

export function dumpErrors(msg: string, errors: IErrorMessage[] | null) {
    console.log(msg);
    if (errors === null) {
        console.log("No Errors");
        return;
    }
    let count: number = 1;
    errors.map((error) => {
        console.log(`${count++}: [severity=${error.severity}] [message=${error.message}] [key=${error.key}]`)
    });
}

const sm: ScriptModel = new ScriptModel();
describe('version check', () => {
    it('version check', () => {
        expect(sm.version).to.equal("0.910");
    });
});

describe("name and description", () => {
    const description: string = "this is the description";
    const scriptName = "scriptName";
    const illegalNameChars: string = ":{}[]\\\'\"";
    expect(sm.ErrorModel.Errors.length).to.equal(0);
    it("illegal chars in description", () => {
        [...illegalNameChars].map((c) => {
            let badDescription: string = description + c;
            sm.description = badDescription;
            expect(sm.ErrorModel.Errors.length).to.equal(2); // no script name gives an error for the logging support
            expect(sm.description).to.equal(badDescription); // we just tell you not to do it, don't enforce it

        });

    })
    it("setting description", () => {
        sm.description = description;
        expect(sm.description).to.equal(description);
    })

    it("illegal chars in script name", () => {
        [...illegalNameChars].map((c) => {
            let badName: string = scriptName + c;
            sm.scriptName = badName;
            expect(sm.ErrorModel.Errors.length).to.equal(1);
            expect(sm.scriptName).to.equal(badName + ".sh");
        });

    })

    it("setting script name", () => {
        sm.scriptName = scriptName;
        expect(sm.scriptName).to.equal(scriptName + ".sh");
        //
        //  if the name ends in ".sh", it shouldn't touchn the name
        sm.scriptName = scriptName + "2.sh";
        expect(sm.scriptName).to.equal(scriptName + "2.sh");
    })
})

function validateVerbose(model: ParameterModel | undefined) {
    expect(model).not.undefined;
    if (model !== undefined) {
        expect(model.default).to.equal("false");
        expect(model.valueIfSet).to.equal("true");
        expect(model.longParameter).to.equal("verbose");
        expect(model.requiredParameter).to.equal(false);
        expect(model.variableName).to.equal("verbose");
        expect(model.type).to.equal("Verbose");
        expect(model.requiresInputString).to.equal(false);
    }
}

function validateCreate(model: ParameterModel | undefined) {
    expect(model).not.undefined;
    if (model !== undefined) {
        expect(model.default).to.equal("false");
        expect(model.valueIfSet).to.equal("true");
        expect(model.longParameter).to.equal("create");
        expect(model.requiredParameter).to.equal(false);
        expect(model.variableName).to.equal("create");
        expect(model.type).to.equal("Create");
        expect(model.requiresInputString).to.equal(false);
    }
}
function validateVerify(model: ParameterModel | undefined) {
    expect(model).not.undefined;
    if (model !== undefined) {
        expect(model.default).to.equal("false");
        expect(model.valueIfSet).to.equal("true");
        expect(model.longParameter).to.equal("verify");
        expect(model.requiredParameter).to.equal(false);
        expect(model.variableName).to.equal("verify");
        expect(model.type).to.equal("Verify");
        expect(model.requiresInputString).to.equal(false);
    }
}
function validateDelete(model: ParameterModel | undefined) {
    expect(model).not.undefined;
    if (model !== undefined) {
        expect(model.default).to.equal("false");
        expect(model.valueIfSet).to.equal("true");
        expect(model.longParameter).to.equal("delete");
        expect(model.requiredParameter).to.equal(false);
        expect(model.variableName).to.equal("delete");
        expect(model.type).to.equal("Delete");
        expect(model.requiresInputString).to.equal(false);
    }
}
function validateInputFile(model: ParameterModel | undefined) {
    expect(model).not.undefined;
    if (model !== undefined) {
        expect(model.valueIfSet).to.equal("$2");
        expect(model.longParameter).to.equal("input-file");
        expect(model.requiredParameter).to.equal(false);
        expect(model.requiresInputString).to.equal(true);
        expect(model.variableName).to.equal("inputFile");
        expect(model.type).to.equal("InputFile");
    }
}
function validateLoggingSupport(model: ParameterModel | undefined) {
    expect(model).not.undefined;
    if (model !== undefined) {
        expect(model.valueIfSet).to.equal("$2");
        expect(model.longParameter).to.equal("log-directory");
        expect(model.requiredParameter).to.equal(false);
        expect(model.requiresInputString).to.equal(true);
        expect(model.variableName).to.equal("logDirectory");
        expect(model.type).to.equal("Logging");
    }
}

function validateRoundTrip(scriptModel: ScriptModel) {
    expect(scriptModel.parameters.length).to.equal(6);
    expect(scriptModel.description).to.equal("this is the description");
    expect(scriptModel.scriptName).to.equal("scriptName2.sh");
    validateVerbose(scriptModel.BuiltInParameters.Verbose);
    validateCreate(scriptModel.BuiltInParameters.Create);
    validateVerify(scriptModel.BuiltInParameters.Verify);
    validateDelete(scriptModel.BuiltInParameters.Delete);
    validateInputFile(scriptModel.BuiltInParameters.InputFile)
    validateLoggingSupport(scriptModel.BuiltInParameters.Logging)
}

describe('Parameters', () => {
    //
    //  add all our built in parametesr
    sm.addParameter(ParameterType.Create);
    sm.addParameter(ParameterType.Verify)
    sm.addParameter(ParameterType.Delete)
    sm.addParameter(ParameterType.Verbose)
    sm.addParameter(ParameterType.InputFile)
    sm.addParameter(ParameterType.Logging)
    //
    //  if you add them twice, they replace the previous one
    sm.addParameter(ParameterType.Create);
    sm.addParameter(ParameterType.Verify)
    sm.addParameter(ParameterType.Delete)
    sm.addParameter(ParameterType.Verbose)
    sm.addParameter(ParameterType.InputFile)
    sm.addParameter(ParameterType.Logging)
    it("count", () => {
        expect(sm.parameters.length).to.equal(6);
    });
    it("Verbose", () => {
        validateVerbose(sm.BuiltInParameters.Verbose);
    });
    it("Create", () => {
        validateCreate(sm.BuiltInParameters.Create);
    });
    it("Verify", () => {

        validateVerify(sm.BuiltInParameters.Verify);
    });
    it("Delete", () => {
        validateDelete(sm.BuiltInParameters.Delete);

    });
    it("InputFileSupport", () => {
        validateInputFile(sm.BuiltInParameters.InputFile)

    });
    it("LoggingSupport", () => {
        validateLoggingSupport(sm.BuiltInParameters.Logging)
    });
});
describe("Generating Files and Round trip support", () => {
    expect(sm.parameters.length).to.equal(6);
    it("generate bash", () => {
        const bash: string = sm.bashScript;
        expect(bash.length).to.be.greaterThan(6000);
    })
    it("generate json", () => {
        expect(sm.JSON.length).to.be.greaterThan(2500); // 2517 chars in .909
    })
    it("generate debug config", () => {
        expect(sm.debugConfig.length).to.be.greaterThan(415); // should be 418
    })
    it("input json", () => {
        expect(sm.inputJSON.length).to.be.greaterThan(200); // should be 202
    })

    it("bash to parameters", () => {
        const newScriptModel: ScriptModel = new ScriptModel();
        newScriptModel.parseBash(sm.bashScript);
        validateRoundTrip(newScriptModel);

    })
    it("JSON to parameters", () => {
        const sm2: ScriptModel = new ScriptModel();
        sm2.parseJSON(sm.JSON, "");
        validateRoundTrip(sm2);

    })

})
