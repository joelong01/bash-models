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
        expect(sm.parameters.length).to.equal(7);
    });
    it ("parsing script", () => {
        const smNew: ScriptModel = new ScriptModel();
        smNew.parseBash(sm.bashScript);
        expect(smNew.parameters.length).to.equal(7);
        expect(smNew.BuiltInParameters.Create).not.undefined;
        expect(smNew.BuiltInParameters.Verify).not.undefined;
        expect(smNew.BuiltInParameters.Delete).not.undefined;
        expect(smNew.BuiltInParameters.Verbose).not.undefined;
        expect(smNew.BuiltInParameters.InputFile).not.undefined;
        expect(smNew.BuiltInParameters.Logging).not.undefined;
    })
});


