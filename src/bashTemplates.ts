export const bashTemplates =
{
    bashTemplate:
        `#!/bin/bash
#---------- see https://github.com/joelong01/BashWizard and https://github.com/joelong01/bash-models----------------
# bash-models version 1.1.6
#
# this will make the error text stand out in red - if you are looking at these errors/warnings in the log file
# you can use cat <logFile> to see the text in color.
function echoError() {
    RED=$(tput setaf 1)
    NORMAL=$(tput sgr0)
    echo "\${RED}\${*}\${NORMAL}"
}
function echoWarning() {
    YELLOW=$(tput setaf 3)
    NORMAL=$(tput sgr0)
    echo "\${YELLOW}\${*}\${NORMAL}"
}
function echoInfo() {
    GREEN=$(tput setaf 2)
    NORMAL=$(tput sgr0)
    echo "\${GREEN}\${*}\${NORMAL}"
}
function echoIfVerbose() {
    if [[ "$verbose" == true ]]; then
        echo "\${*}"
    fi
}


function gnuGetOptInstalled() {
    getopt --test >/dev/null
    if [[ \${PIPESTATUS[0]} -ne 4 ]]; then
        echo false
    else
        echo true
    fi
}

__DETECT__JQ__


# a variable used by the script to decide if it should prompt before installing dependencies.
# users can change this true or false
readonly AUTO_INSTALL_DEPENDENCIES=__AUTO_INSTALL__VALUE__

GNU_GETOPT_INSTALLED=$(gnuGetOptInstalled)
__DECLARE_JQ_INSTALLED__

# make sure this version of *nix gnu-getopts installed. macs have a non-gnu-getops which doesn't support long parameters
if [[ $GNU_GETOPT_INSTALLED = false __CHECK_FOR_JQ__]]; then
    OS=$(uname)
    if [[ $OS == "Darwin" ]]; then
        if [[ $GNU_GETOPT_INSTALLED == false ]]; then
            if [[ $AUTO_INSTALL_DEPENDENCIES != true ]]; then
                read -r -p "install gnu-getopt using brew? [y,n]" response
                if [[ $response != 'y' ]] && [[ $response != 'Y' ]]; then
                    echoError "Missing gnu-getopt dependecy.  exiting."
                    exit
                fi
            fi
            echoInfo "installing gnu-getopt and updating path in ~/.bash_profile"
            ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" </dev/null 2>/dev/null
            brew install gnu-getopt
            #Expressions don't expand in single quotes, use double quotes for that. - but we don't want $PATH expanded, so disable linter rule
            #shellcheck disable=SC2016
            echo 'export PATH="/usr/local/opt/gnu-getopt/bin:$PATH"' >>~/.bash_profile
        fi
        __JQ_DEPENDENCY__
        # if we got here, we installed something.  so launch a new shell in the interactive mode and run this scrip ($0) with the parameters that were passed in ($"{@}")
        #
        # note that the '--' tells the exec command that everything after it is for the next command, not parameters for exec
        exec bash -l -i -- "\${0}" "\${@}"
        exit
    fi
fi


function usage() {
    __USAGE_INPUT_STATEMENT__
__USAGE_LINE__ 1>&2
__USAGE__
    echo ""
    exit 1
}
function echoInput() {
    echo __ECHO__
}

function parseInput() {

    local OPTIONS=__SHORT_OPTIONS__
    local LONGOPTS=__LONG_OPTIONS__

    # -use ! and PIPESTATUS to get exit code with errexit set
    # -temporarily store output to be able to check for errors
    # -activate quoting/enhanced mode (e.g. by writing out "--options")
    # -pass arguments only via -- "$@" to separate them correctly
    PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
    if [[ \${PIPESTATUS[0]} -ne 0 ]]; then
        # e.g. return value is 1
        # then getopt has complained about wrong arguments to stdout
        usage
        exit 2
    fi
    # read getopt\'s output this way to handle the quoting right:
    eval set -- "$PARSED"
    while true; do
        case "$1" in
__INPUT_CASE__
        --)
            shift
            break
            ;;
        *)
            echoError "Invalid option $1 $2"
            exit 3
            ;;
        esac
    done
}
# input variables
__INPUT_DECLARATION__

parseInput "$@"

___PARSE_INPUT_FILE___
__REQUIRED_PARAMETERS__
__LOGGING_SUPPORT_
__VERBOSE_ECHO__

    # --- BEGIN USER CODE ---
    __USER_CODE_1__
    # --- END USER CODE ---
__END_LOGGING_SUPPORT__`,
    logTemplate:
        `#logging support
if [[ -z "\${logDirectory}" ]]; then
    echoWarning "Log Directory can't be empty.  setting to ."
    logDirectory="./"
fi
# make sure that the logDirectory ends in a /
if ! [[ "\${logDirectory}" =~ .*/$ ]]; then
    logDirectory="\${logDirectory}/"
fi
declare LOG_FILE="\${logDirectory}__LOG_FILE_NAME__"
{
    echoIfVerbose "logFile is $LOG_FILE"
    mkdir -p "\${logDirectory}"
} 2>>/dev/null
#creating a tee so that we capture all the output to the log file
{
    time=$(date +"%m/%d/%y on %r")
    echo "started  \${0}" "\${@}" "@ $time"`,
    parseInputTemplate:
        `# if command line tells us to parse an input file
if [ \"\${inputFile}\" != "" ]; then
    # load parameters from the file
    configSection=$(jq . <\"\${inputFile}\" | jq '."__SCRIPT_NAME__"')
    if [[ -z $configSection ]]; then
        echoError "$inputFile or __SCRIPT_NAME__ section not found "
        exit 3
    fi
__FILE_TO_SETTINGS__
    # we need to parse the again to see if there are any overrides to what is in the config file
    parseInput "$@"
fi`,
    requiredVariablesTemplate:
        `#verify required parameters are set
if __REQUIRED_FILES_IF__; then
    echo ""
    echoError "Required parameter missing! "
    echoInput #make it easy to see what is missing
    echo ""
    usage
    exit 2
fi`,
    endOfBash:
        `
    time=$(date +"%m/%d/%y on %r")
    echo "ended:  \${0}" "\${@}" "@ $time"
} | tee -a \"\${LOG_FILE}\"
`,
    verifyCreateDelete:
        `   function onVerify() {
        echo "onVerify"
    }
    function onDelete() {
        echo "onDelete"
    }
    function onCreate() {
        echo "onCreate"
    }
    __USER_CODE_1__

    #
    #  this order makes it so that passing in /cvd will result in a verified resource being created
    #

    if [[ $delete == "true" ]]; then
        onDelete
    fi

    if [[ $create == "true" ]]; then
        onCreate
    fi

    if [[ $verify == "true" ]]; then
        onVerify
    fi`,
    checkJqDependency: `|| $JQ_INSTALLED = false `,
    checkJqFunction: `function jqInstalled() {
        if [[ -z $(command -v jq) ]]; then
            echo false
        else
            echo true
        fi
    }`,
    declareJqInstalled: `JQ_INSTALLED=$(jqInstalled)`,
    installJqDependency:
        `if [[ $JQ_INSTALLED == false ]]; then
            if [[ $AUTO_INSTALL_DEPENDENCIES != true ]]; then
                read -r -p "install jq using brew? [y,n]" response
                if [[ $response != 'y' ]] && [[ $response != 'Y' ]]; then
                    echoError "Missing jq dependency.  exiting."
                    exit
                fi
            fi
            # now install jq
            brew install jq
        fi
`,
    verboseEcho:
        `    if [[ "$verbose" == true ]];then
        echoInput
    fi`
}

export default bashTemplates;
