import { ScriptModel } from "../scriptModel"
import { expect } from 'chai';
import 'mocha';
import { ParameterType, IScriptModelState, IErrorMessage } from "../commonModel";
import "./customParameters.spec"
const sm: ScriptModel = new ScriptModel();
describe('generate script', () => {
    it("creating script", () => {
        sm.addParameter(ParameterType.Create);
        sm.addParameter(ParameterType.Verify)
        sm.addParameter(ParameterType.Delete)
        sm.addParameter(ParameterType.Verbose)
        sm.addParameter(ParameterType.InputFile)
        sm.addParameter(ParameterType.Logging)
        sm.addParameter(ParameterType.Custom);
        sm.autoInstallDependencies = true;
        expect(sm.parameters.length).to.equal(7);
    });
    const smNew: ScriptModel = new ScriptModel();
    it("parsing script", () => {
        smNew.parseBash(sm.bashScript);
        expect(smNew.parameters.length).to.equal(7);
        expect(smNew.BuiltInParameters.Create).not.undefined;
        expect(smNew.BuiltInParameters.Verify).not.undefined;
        expect(smNew.BuiltInParameters.Delete).not.undefined;
        expect(smNew.BuiltInParameters.Verbose).not.undefined;
        expect(smNew.BuiltInParameters.InputFile).not.undefined;
        expect(smNew.BuiltInParameters.Logging).not.undefined;
        expect(smNew.autoInstallDependencies).true;
    })
});

describe('verifying JSON properties', () => {
    const smJsonTest:ScriptModel = new ScriptModel();
    smJsonTest.addParameter(ParameterType.InputFile)
    const description:string = "a test of roundtrip through JSON"
    smJsonTest.description = description;
    smJsonTest.scriptName="test.sh";
    smJsonTest.autoInstallDependencies = true;
    expect(smJsonTest.parameters.length).to.equal(1);
    const jsonFormat: string = smJsonTest.JSON;
    it("Description", () => {
        expect(hasKey("Description", jsonFormat)).true;
    });
    it("ScriptName", () => {
        expect(hasKey("ScriptName", jsonFormat)).true;
    });
    it("Version", () => {
        expect(hasKey("Version", jsonFormat)).true;
    });
    it("AutoInstallDependencies", () => {
         expect(hasKey("AutoInstallDependencies", jsonFormat)).true;
     });

     it ("Bash from JSON", () => {

        const smBash:ScriptModel = new ScriptModel();
        const ret = smBash.parseJSON(smJsonTest.JSON, "");
        expect(ret).true;

        expect (smBash.autoInstallDependencies).true;
        expect(smBash.description).equals(description);
        expect(smBash.scriptName).equals(smJsonTest.scriptName);
     });
});

function hasKey(key: string, from: string): boolean {
    return (from.indexOf(key) !== -1);
}

