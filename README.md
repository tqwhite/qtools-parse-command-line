# qtools Parse Command Line

======================================================
UPDATED: Now parses injected string instead of argv

New parameters: injectedCommandString, injectFirstTwoElements

Added input parameter, injectedCommandString, that substitutes
an artificially created command string for process.argv. It is parsed by injectedCommandString.split(/ +/) and
as far as I can tell, acts exactly like it should, ie, if
    injectedCommandString.replace(/ +/g, ' ')==process.argv.join(' ')
then it produces the same result.

NOTE: Normal process.argv has node and the program name in the first
two positions in the argv array. If you your artificial command
string is values only, ie, does not have the first two values,
you can add the parameter, injectFirstTwoElements:true. This will
inject a pair of dummy values at the front of the fake argv array
and all will work correctly.

tqii 5/13/24
======================================================

processCommandLine() analyzes argv and returns the results for use by
the calling program.

For historical reasons, it defaults to evaluating incoming Javascript.
This can, of course, be dangerous. It should be called with the
'noFunctions:true' argument unless you need function evaluation.

tqii 11/14/25
======================================================

Added switchesList and three convenience methods.


## Example

progName -switch1 -switch2 --value1=a --value2 1,2,3 some other stuff 'and more stuff' //--value params delimited by space or equal sign

var commandLineParms = qtools.parseCommandLine({noFunctions:true})

processCommandLine() produces an object with six
elements:
```
   { calledFromCommandLine: true|false,
     fileList:['some', 'other', 'stuff', 'and more stuff'],
     values: {value1:['a'], value2:['1', '2', '3']},
     functions: {},
     switches: {switch1:true, switch2:true},
     switchesList: ['switch1', 'switch2'],

     isSwitchSet: function(switchName){},
     getValueArray: function(valueName){},
     getLastValue: function(valueName, defaultValue){}
    }
```


- fileList has anything that does not follow a string starting with a hyphen.

- switches is a list of the switches that start with one hyphen. These take no values.

- values is a map derived from the switches that start with two hyphens. The property value is the value following a space or equal after the switch

- switchesList is an array of the names of all switches that are set to true

All four of the above are always defined, array or object, as appropriate.

```
    exampleAbove.isSwitchSet('switch1'); //-> true
    exampleAbove.getValueArray('value1') // -> ['a']
    exampleAbove.getValueArray('value2') // -> ['1', '2', '3']
    exampleAbove.getLastValue('value2'); // -> '3'
```


UPDATE (6/28/18) added:

--name value

UPDATE (11/4/19) ADDED:

--namelist=sam,henry,joan

(If valuesSplitCharacter is specified in args; otherwise, still a string)

applies to all cases below.

Anything in the command line of that form is processed to become
either a value or a function.

1) Parsed to see if it's javascript and evaluated
    eg,
   
        --tmp="(2+5)"
   
    produces a property 
   
        values:{tmp:7}
   
    or,
   
        --tmp="(function(a){return 2*a})"
   
    produces a property 
   
        functions:{tmp:function(a){return 2*a;}}
   
    that can be called later as commandLineOutput.functions.tmp(parameter)
   
    or (of course),
   
        --tmp="hello world"
   
    produces a property 
   
        values:{tmp:"hello world"}
   
    however, there is a special case for strings, eg,
   
        --tmp=/path/to/function.js
   
    is checked to see if it resolves to a file. (The path is *not* relative 
   
    or glob'd. It must be fully specified.)
   
    If it does not produce a value, the property is then eval'd to
   
    see if it produces a value.
   
        values:{tmp:"/path/to/function.js"}
   
    If it does parse and produce a value, the property is,
   
        values:{tmp:'some value resulting from the file'}
   
    unless it results in a function, in which case, the property is,
   
        functions:{tmp:function(){/ *whatever is in the file* /}}

    Important note: The function definition must be wrapped in parenthesis.
    
    eg,
    
        (function(input){ return input*2;})
    
    Otherwise it will not eval() and will be treated as a string value.

SWITCHES 

-switchName 

Anything of that form creates a property,
    values:{switchName:true}

CONVENIENCE METHODS

isSwitchSet(switchName) returns true if the switch is set, false otherwise.

    eg,

        if (parameters.isSwitchSet('verbose')) {
            console.log('Verbose mode enabled');
        }

getValueArray(valueName) returns the value for a given parameter name,
or undefined if not set.

    eg,

        const files = parameters.getValueArray('input');

getLastValue(valueName, defaultValue) for array values (from comma-separated
lists), returns the last element. For single values, returns the value itself.
If not found, returns the optional defaultValue.

    eg,

        --files=file1.txt,file2.txt,file3.txt

        const lastFile = parameters.getLastValue('files');
        // Returns 'file3.txt'

        const output = parameters.getLastValue('output', 'default.txt');
        // Returns 'default.txt' if output was not specified

## Example

Given the command:

```
node script.js file1.txt -a --name=value --list=item1,item2
```

The `getParameters()` function would return:

```javascript
{
  calledFromCommandLine: true,
  fileList: ['file1.txt'],
  values: {
    name: ['value'],
    list: ['item1', 'item2']
  },
  functions: {},
  switches: {
    a: true
  },
  switchesList: ['a'],
  isSwitchSet: [Function: isSwitchSet],
  getValueArray: [Function: getValueArray],
  getLastValue: [Function: getLastValue]
}
```

In this example:

- `file1.txt` is added to the fileList array (any parameter without a switch)
- `-a` is captured as a switch with value `true`
- `--name=value` is stored in values as `{name: 'value'}`
- `--list=item1,item2` is split by the comma and stored as an array in values: `{list: ['item1', 'item2']}`