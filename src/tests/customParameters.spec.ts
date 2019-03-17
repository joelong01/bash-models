import { ScriptModel } from "../scriptModel"
import { expect } from 'chai';
import 'mocha';
import { ParameterType, IScriptModelState } from "../commonModel";
import ParameterModel from "../ParameterModel";
import "./builtInParameters.spec" // forces mocha to run it first
import { it } from "mocha";
import {dumpErrors} from "./builtInParameters.spec"

const sm2: ScriptModel = new ScriptModel();


class ScriptModelCallBack {

    scriptModelChanged = (state: Partial<IScriptModelState>) => {
        //  console.count("scriptModelChanged\n")
        Object.keys(state).map((key) => {
            if (state[key] !== undefined) {
                if (key === "JSON" || key === "bashScript" || key === "debugConfig" || key === "inputJson") {
                    //  console.log(`[${key} changed}]`)
                }
                else {
                    // console.log(`[${key} = ${state[key]}]`)
                }
            }
        });
        /* expect(state).not.equal(undefined);
        expect(state).not.equal(null);
        expect(state.parameters).not.equal(undefined);
        expect(state.parameters).not.equal(null);
        const param: ParameterModel = state.parameters![state.parameters!.length - 1]; // note: test enforcing order semantics */
    }
}
const cb: ScriptModelCallBack = new ScriptModelCallBack();

describe('custom parameters', () => {
    let params: ParameterModel[];
    it("adding custom param", () => {
        expect(cb.scriptModelChanged).not.equal(undefined);
        sm2.onScriptModelChanged.subscribe(cb.scriptModelChanged);
        params = sm2.addParameter(ParameterType.Custom);
        expect(params.length).to.equal(1);
    })

    it("count", () => {
        expect(sm2.parameters.length).to.equal(1);
    });

    it("Error", () => {
        expect(sm2.ErrorModel.Errors.length).to.equal(1);
    });

    it("auto generate short name and variable name", () => {
        const param: ParameterModel = params[0];
        param.longParameter = "--long-parameter";
        expect(param.longParameter).to.equal("long-parameter");
        expect(param.shortParameter).to.equal("l");
        expect(param.variableName).to.equal("longParameter");
    })

    it ("defaults", () => {
        const param: ParameterModel = params[0];
        param.default = "true";
        param.requiredParameter = true;
        expect(param.default).to.equal("");
        expect(param.requiredParameter).to.equal(true);
        param.requiredParameter = false;
        expect(param.default).to.equal("true");
        expect(param.requiredParameter).to.equal(false);
    })
    it ("input string", () => {
        const param: ParameterModel = params[0];
        param.requiresInputString = true;
        expect(param.valueIfSet).is.equal("$2");
        param.requiresInputString = false;
        expect(param.valueIfSet).is.equal("");
        param.requiresInputString = false;
        param.valueIfSet = "$2";
        expect(param.requiresInputString).is.equal(true);
    })

    it ("duplicate names", () => {
        params = sm2.addParameter(ParameterType.Custom);
        expect(params.length).to.equal(2);
        const param: ParameterModel = params[1];
        param.longParameter = "--long-parameter";
        expect(param.shortParameter).to.equal("o");
        expect(sm2.ErrorModel.Errors.length).to.equal(2);
        param.longParameter = "--long-parameter2";
        expect(sm2.ErrorModel.Errors.length).to.equal(1);
        param.variableName = "longParameter2";
        expect(sm2.ErrorModel.Errors.length).to.equal(0);
    })

    sm2.onScriptModelChanged.unsubscribe(cb.scriptModelChanged);
});

