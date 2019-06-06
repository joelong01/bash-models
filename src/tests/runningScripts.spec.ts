/***
 *  this test file will create a bash file and then run it looking at the output
 *
 *  it also looks for code in the file based on the parameters/options that are
 *  selected.  this might turn out to be problamatic because as the code evolves,
 *  the test will have to be updated.  i'm hoping that it means only deliberate
 *  changes are introduced.
 *
 */



import { ScriptModel } from "../scriptModel"
import { expect } from 'chai';
import 'mocha';
import { ParameterType } from "../commonModel";
import * as fs from 'fs';
import { exec, ExecException } from "child_process";

const outputDir = "./testOutput/";
const scriptName: string = "test1.sh";
const logDirectory: string = outputDir;
const inputFileName: string = "test1.input.json";
const description: string = "a test script";
const sm: ScriptModel = new ScriptModel();

function dumpExecValues(error: ExecException | null, output: string, stderr: string) {
    console.log("Errors")
    console.log("======")
    console.log("%o", error)
    console.log("Output")
    console.log("======")
    console.log(output)
    console.log("StdError")
    console.log("========")
    console.log(stderr)
}
before((done) => {
    // console.log("before")
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    sm.addParameter(ParameterType.Create);
    sm.addParameter(ParameterType.Verify)
    sm.addParameter(ParameterType.Delete)
    sm.addParameter(ParameterType.Verbose)
    sm.addParameter(ParameterType.InputFile)
    sm.addParameter(ParameterType.Logging)
    sm.scriptName = scriptName;
    sm.description = description;
    sm.autoInstallDependencies = true;
    sm.UserCode = "echo \"ran the test\""
    fs.writeFileSync(outputDir + scriptName, sm.bashScript, 'utf8')

    var inputJson: object = JSON.parse(sm.inputJSON);
    fs.chmodSync(outputDir + scriptName, 0o777)
    inputJson[scriptName].create = true;
    inputJson[scriptName].verify = true;
    inputJson[scriptName].delete = false;
    inputJson[scriptName].verbose = true;
    inputJson[scriptName]["log-directory"] = logDirectory;
    fs.writeFileSync(outputDir + inputFileName, JSON.stringify(inputJson), 'utf8');
    //console.log(JSON.stringify(inputJson))
    done();
})
after((done) => {
    // console.log("after")
    /*  if (fs.existsSync(scriptName)) {
         fs.unlinkSync(scriptName);
     }
     if (fs.existsSync(inputFileName)) {

         fs.unlinkSync(inputFileName);
     }
     if (fs.existsSync(scriptName + ".log")) {

         fs.unlinkSync(scriptName + ".log");
     } */
    done();
})
describe('Running Script', () => {
    it("creating script", () => {
        expect(fs.existsSync(outputDir + scriptName)).true;
    })
    it("verify bad input", () => {

        // We saved the script above, now we run it with a --help, which is an invalid switch for this script

        exec(outputDir + scriptName + " --help", (error: ExecException | null, output: string, stderr: string) => {
            //   dumpExecValues(error, output, stderr)
            //
            //  these are the strings we expect to get back
            const expectedError: string = `unrecognized option '--help'\nUsage: ./testOutput/test1.sh  -c|--create `;// `Usage: test1.sh  -c|--create -v|--verify -d|--delete -e|--verbose -i|--input-file -l|--log-directory `;
            const expectedOutput1: string = `Parameters can be passed in the command line or in the input file. The command line overrides the setting in the input file.`;
            const usageTable: string[] =
                [
                    `-c | --create            Optional     calls the onCreate function in the script`,
                    `-v | --verify            Optional     calls the onVerify function in the script`,
                    `-d | --delete            Optional     calls the onDelete function in the script`,
                    `-e | --verbose           Optional     echos the parsed input variables and creates a false variable to be used in user code`,
                    `-i | --input-file        Optional     the name of the input file. pay attention to /mnt/e/GitHub/bash-models when setting this`,
                    `-l | --log-directory     Optional     Directory for the log file. The log file name will be based on the script name.`
                ];

            const expectedStdError: string = `test1.sh: unrecognized option '--help'`

            //
            //  assert what we expect
            expect(error!.message.includes(expectedError)).true;
            expect(stderr.includes(expectedStdError)).true;
            expect(output.includes(expectedOutput1)).true;
            usageTable.forEach((line) => {
                expect(output.includes(line)).true;
            })
        })


    })
    it("verify short param input", () => {

        // We saved the script above, now we run it with a -vcd, which are all valid. verify that the user
        // code runs, and the create, verify, and delete functions run

        exec(outputDir + scriptName + " -vcd", (error: ExecException | null, output: string, stderr: string) => {
            expect(output.includes("ran the test")).true;
            expect(output.includes("onDelete")).true;
            expect(output.includes("onVerify")).true;
            expect(output.includes("onCreate")).true;
            expect(error).is.null;
            expect(stderr).is.empty;
        })
    });
    it("verify long param input", () => {

        // We saved the script above, now we run it with a -vcd, which are all valid. verify that the user
        // code runs, and the create, verify, and delete functions run

        exec(outputDir + scriptName + " --create --verify --delete", (error: ExecException | null, output: string, stderr: string) => {
            expect(output.includes("ran the test")).true;
            expect(output.includes("onDelete")).true;
            expect(output.includes("onVerify")).true;
            expect(output.includes("onCreate")).true;
            expect(error).is.null;
            expect(stderr).is.empty;
        })
    });
    it("verify verbose parameter", () => {

        //  run with --verbose and check the output
        //  note these have the escape sequences to make the text green
        const expectedOutput: string[] =
            [`create........... [32mtrue(B[m`,
                `verify........... [32mtrue(B[m`,
                `delete........... [32mfalse(B[m`,
                `verbose.......... [32mtrue(B[m`,
                `input-file....... [32m` + outputDir + inputFileName + `(B[m`,
                `log-directory.... [32m` + outputDir + `(B[m`
            ]
        const toExec: string = outputDir + scriptName + " --verbose --log-directory " + outputDir + " --input-file " + outputDir + inputFileName;
        exec(toExec, (error: ExecException | null, output: string, stderr: string) => {
            //    dumpExecValues(error, output, stderr)
            expectedOutput.forEach((line) => {
                if (!output.includes(line)) {
                    console.log(`${line} not in output`)
                }
                expect(output.includes(line)).true;
            })
            expect(error).is.null;
            expect(stderr).is.empty;


        })
    });
    it("verify input file parameter", () => {

        const toExec = outputDir + scriptName + " --verbose --input-file " + outputDir + inputFileName;
        // console.log("toExec: " + toExec)
        exec(toExec, (error: ExecException | null, output: string, stderr: string) => {
            // dumpExecValues(error, output, stderr)
            expect(output.includes("ran the test")).true;
            expect(output.includes("onDelete")).false;
            expect(output.includes("onVerify")).true;
            expect(output.includes("onCreate")).true;
            expect(error).is.null;
            expect(stderr).is.empty;


        })
    });
})

/**
 * .replace() with /\s+/g regexp is changing all groups of white-spaces characters to a single space in the whole string then we .trim() the result to remove all exceeding white-spaces before and after the text.
 *  Are considered as white-spaces characters: [ \f\n\r\t\v​\u00a0\u1680​\u2000​-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
 *
 * we need this because getting the whitepace exactly right when comparing the output of the scripts proved difficult
 *
 * @param inString the string to cleanup
 */
function CleanupWhiteSpace(inString: string): string {
   return inString.replace(/\s+/g, '').trim();
}

describe('Code Analysis', () => {

    it("verifying autoInstallDependencies", () => {
        sm.autoInstallDependencies = true;
        expect(sm.bashScript.includes("readonly AUTO_INSTALL_DEPENDENCIES=true")).true;
        sm.autoInstallDependencies = false;
        expect(sm.bashScript.includes("readonly AUTO_INSTALL_DEPENDENCIES=false")).true;
    })

    it("verifying inputFile", () => {
        const jqFunc: string = CleanupWhiteSpace(`function jqInstalled() {
            if [[ -z $(command -v jq) ]]; then
                echo false
            else
                echo true
            fi
        }`)

        const installJq: string = CleanupWhiteSpace(`
        if [[ $JQ_INSTALLED == false ]]; then
            if [[ $AUTO_INSTALL_DEPENDENCIES != true ]]; then
                read -r -p "install jq using brew? [y,n]" response
                if [[ $response != 'y' ]] && [[ $response != 'Y' ]]; then
                    echoError "Missing jq dependency.  exiting."
                    exit
                fi
            fi
            # now install jq
            brew install jq
        fi`);

        const readInputFromFile: string = CleanupWhiteSpace(`# if command line tells us to parse an input file
        if [ "\${inputFile}" != "" ]; then
            # load parameters from the file
            configSection=$(jq . <"\${inputFile}" | jq '."test1.sh"')
            if [[ -z $configSection ]]; then
                echoError "$inputFile or test1.sh section not found "
                exit 3
            fi
            create=$(echo "\${configSection}" | jq '.["create"]' --raw-output)
            verify=$(echo "\${configSection}" | jq '.["verify"]' --raw-output)
            delete=$(echo "\${configSection}" | jq '.["delete"]' --raw-output)
            verbose=$(echo "\${configSection}" | jq '.["verbose"]' --raw-output)
            logDirectory=$(echo "\${configSection}" | jq '.["log-directory"]' --raw-output)

            # we need to parse the again to see if there are any overrides to what is in the config file
            parseInput "$@"
        fi`)
        //
        //  if the InputFile parameter is present, we have a bunch of JQ specific code in the script
        //  make sure it is there
        var bashNoWhiteSpace: string = CleanupWhiteSpace(sm.bashScript);
        fs.writeFileSync(outputDir + "bashNoWhiteSpace.sh", bashNoWhiteSpace);
        fs.writeFileSync(outputDir + "jqfunc.sh", jqFunc);
        expect(sm.BuiltInParameters.InputFile).not.null;
        expect(bashNoWhiteSpace.includes(jqFunc)).true;
        expect(bashNoWhiteSpace.includes(installJq)).true;
        expect(bashNoWhiteSpace.includes(readInputFromFile)).true;
        expect(bashNoWhiteSpace.includes("JQ_INSTALLED=$(jqInstalled)")).true;

        //
        //  take the parameter out and make sure the code is not there
        sm.deleteParameter(sm.BuiltInParameters.InputFile!);
        bashNoWhiteSpace = CleanupWhiteSpace(sm.bashScript);
        expect(sm.BuiltInParameters.InputFile).is.undefined;
        expect(bashNoWhiteSpace.includes(jqFunc)).false;
        expect(bashNoWhiteSpace.includes("JQ_INSTALLED=$(jqInstalled)")).false;
        expect(bashNoWhiteSpace.includes(CleanupWhiteSpace(`if [ "\${inputFile}" != "" ]; then`))).false;
    })

    it("verifying logging support", () => {
        expect(sm.BuiltInParameters.Logging).not.null;
        expect(sm.BuiltInParameters.Logging).not.undefined;
        const loggingScript: string = CleanupWhiteSpace(`#logging support
        if [[ -z "\${logDirectory}" ]]; then
            echoWarning "Log Directory can't be empty.  setting to ."
            logDirectory="./"
        fi
        # make sure that the logDirectory ends in a /
        if ! [[ "\${logDirectory}" =~ .*/$ ]]; then
            logDirectory="\${logDirectory}/"
        fi
        declare LOG_FILE="\${logDirectory}test1.sh.log"
        {
            echoIfVerbose "logFile is $LOG_FILE"
            mkdir -p "\${logDirectory}"
        } 2>>/dev/null
        #creating a tee so that we capture all the output to the log file
        {
            time=$(date +"%m/%d/%y on %r")
            echo "started  \${0}" "\${@}" "@ $time"`)

        const endTee: string = CleanupWhiteSpace(`time=$(date +"%m/%d/%y on %r")echo "ended:  \${0}" "\${@}" "@ $time"} | tee -a "\${LOG_FILE}"`)

        var bashNoWhiteSpace: string = CleanupWhiteSpace(sm.bashScript);
        expect(bashNoWhiteSpace.includes(loggingScript)).true;
        expect(bashNoWhiteSpace.includes(endTee)).true;

        sm.deleteParameter(sm.BuiltInParameters.Logging!);
        expect(sm.BuiltInParameters.Logging).is.undefined;
        bashNoWhiteSpace = CleanupWhiteSpace(sm.bashScript);
        expect(bashNoWhiteSpace.includes(loggingScript)).false;
        expect(bashNoWhiteSpace.includes(loggingScript)).false;
        expect(bashNoWhiteSpace.includes(endTee)).false;

    })
    it("verifying verbose", () => {
        sm.addParameter(ParameterType.Logging) // needed for the checkLog
        expect(sm.BuiltInParameters.Verbose).not.null;
        expect(sm.BuiltInParameters.Verbose).not.undefined;
        const declareVar:string = CleanupWhiteSpace(`declare verbose=false`)
        const checkLog:string = CleanupWhiteSpace(` echoIfVerbose "logFile is \$LOG_FILE"`)
        const echoOutPut:string = CleanupWhiteSpace('if [[ "\$verbose" == true ]];then echoInput fi')
        var bashNoWhiteSpace: string = CleanupWhiteSpace(sm.bashScript);
        expect(bashNoWhiteSpace.includes(declareVar)).true;
        expect(bashNoWhiteSpace.includes(checkLog)).true;
        expect(bashNoWhiteSpace.includes(echoOutPut)).true;
        sm.deleteParameter(sm.BuiltInParameters.Verbose!);
        expect(sm.BuiltInParameters.Verbose).is.undefined;
        bashNoWhiteSpace = CleanupWhiteSpace(sm.bashScript);
        expect(bashNoWhiteSpace.includes(declareVar)).false;
        expect(bashNoWhiteSpace.includes(checkLog)).true; // this is inside an echoIfVerbose, so it is not dependent on the Verbose var being present...bug?
        expect(bashNoWhiteSpace.includes(echoOutPut)).false;

    })

    it("verifying create, verify, delete", () => {
        sm.addParameter(ParameterType.Create) // needed for the checkLog
        sm.addParameter(ParameterType.Verify) // needed for the checkLog
        sm.addParameter(ParameterType.Delete) // needed for the checkLog
        expect(sm.BuiltInParameters.Create).not.null;
        expect(sm.BuiltInParameters.Create).not.undefined;
        expect(sm.BuiltInParameters.Verify).not.null;
        expect(sm.BuiltInParameters.Verify).not.undefined;
        expect(sm.BuiltInParameters.Delete).not.null;
        expect(sm.BuiltInParameters.Delete).not.undefined;

        const verifyFunc = CleanupWhiteSpace(`function onVerify() {echo "onVerify"}`)
        const delFunc = CleanupWhiteSpace(`function onDelete() {echo "onDelete"}`)
        const createFunc = CleanupWhiteSpace(`function onCreate() {echo "onCreate"}`)

        var bashNoWhiteSpace: string = CleanupWhiteSpace(sm.bashScript);
        expect(bashNoWhiteSpace.includes(verifyFunc)).true;
        expect(bashNoWhiteSpace.includes(delFunc)).true;
        expect(bashNoWhiteSpace.includes(createFunc)).true;
        sm.deleteParameter(sm.BuiltInParameters.Create!);
        sm.deleteParameter(sm.BuiltInParameters.Verify!);
        sm.deleteParameter(sm.BuiltInParameters.Delete!);

        expect(sm.BuiltInParameters.Create).is.undefined;
        expect(sm.BuiltInParameters.Verify).is.undefined;
        expect(sm.BuiltInParameters.Delete).is.undefined;
        bashNoWhiteSpace = CleanupWhiteSpace(sm.bashScript);
        expect(bashNoWhiteSpace.includes(verifyFunc)).false;
        expect(bashNoWhiteSpace.includes(delFunc)).false;
        expect(bashNoWhiteSpace.includes(createFunc)).false;

    })

})



