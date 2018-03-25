# Query-Engine

A node.js query engine for university courses and rooms, supporting RESTful Web service

## Project configuration

Before running the project app, execute the following commands to prepare the project's tooling and dependencies.

OS X / Linux:

1. ```yarn run clean```

1. ```yarn install```

1. ```yarn run build```

Windows:

1. ```yarn run cleanwin```

1. ```yarn install```

1. ```yarn run build```

## Query Syntax

```ENBF

QUERY           ::='{'BODY ', ' OPTIONS '}'

BODY            ::= 'WHERE:{' FILTER '}'

OPTIONS         ::= 'OPTIONS:{' COLUMNS (', ORDER:' key)? '}'

FILTER          ::= (LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION)

LOGICCOMPARISON ::= LOGIC ':[{' FILTER ('}, {' FILTER )* '}]'  

MCOMPARISON     ::= MCOMPARATOR ':{' m_key ':' number '}'  

SCOMPARISON     ::= 'IS:{' s_key ':' [*]? inputstring [*]? '}'  // inputstring may have option * characters as wildcards

NEGATION        ::= 'NOT :{' FILTER '}'

LOGIC           ::= 'AND' | 'OR' 

MCOMPARATOR     ::= 'LT' | 'GT' | 'EQ' 

COLUMNS         ::= 'COLUMNS:[' (key ',')* key ']'

key             ::= (s_key | m_key) //semantics for each key detailed below

s_key           ::= 'courses_'('dept' | 'id' | 'instructor' |
                    'title' | 'uuid')              
m_key           ::= 'courses_'('avg' | 'pass' | 'fail' | 'audit')

inputstring     ::= [^*]+ //one or more of any character except asterisk.

```

## Query Examples

Query Input:

```json

{
  "WHERE":{
     "GT":{
        "courses_avg":97
     }
  },
  "OPTIONS":{
     "COLUMNS":[
        "courses_dept",
        "courses_avg"
     ],
     "ORDER":"courses_avg"
  }
}

```

Query Output:

```json
{ 
 result:
  [ { courses_dept: 'epse', courses_avg: 97.09 },
    { courses_dept: 'math', courses_avg: 97.09 },
    { courses_dept: 'math', courses_avg: 97.09 },
    { courses_dept: 'epse', courses_avg: 97.09 },
    { courses_dept: 'math', courses_avg: 97.25 },
    { courses_dept: 'math', courses_avg: 97.25 },
    { courses_dept: 'epse', courses_avg: 97.29 },
    { courses_dept: 'epse', courses_avg: 97.29 },
    { courses_dept: 'nurs', courses_avg: 97.33 },
    { courses_dept: 'nurs', courses_avg: 97.33 },
    { courses_dept: 'epse', courses_avg: 97.41 },
    { courses_dept: 'epse', courses_avg: 97.41 },
    { courses_dept: 'cnps', courses_avg: 97.47 },
    { courses_dept: 'cnps', courses_avg: 97.47 },
    { courses_dept: 'math', courses_avg: 97.48 },
    { courses_dept: 'math', courses_avg: 97.48 },
    { courses_dept: 'educ', courses_avg: 97.5 },
    { courses_dept: 'nurs', courses_avg: 97.53 },
    { courses_dept: 'nurs', courses_avg: 97.53 },
    { courses_dept: 'epse', courses_avg: 97.67 },
    { courses_dept: 'epse', courses_avg: 97.69 },
    { courses_dept: 'epse', courses_avg: 97.78 },
    { courses_dept: 'crwr', courses_avg: 98 },
    { courses_dept: 'crwr', courses_avg: 98 },
    { courses_dept: 'epse', courses_avg: 98.08 },
    { courses_dept: 'nurs', courses_avg: 98.21 },
    { courses_dept: 'nurs', courses_avg: 98.21 },
    { courses_dept: 'epse', courses_avg: 98.36 },
    { courses_dept: 'epse', courses_avg: 98.45 },
    { courses_dept: 'epse', courses_avg: 98.45 },
    { courses_dept: 'nurs', courses_avg: 98.5 },
    { courses_dept: 'nurs', courses_avg: 98.5 },
    { courses_dept: 'epse', courses_avg: 98.58 },
    { courses_dept: 'nurs', courses_avg: 98.58 },
    { courses_dept: 'nurs', courses_avg: 98.58 },
    { courses_dept: 'epse', courses_avg: 98.58 },
    { courses_dept: 'epse', courses_avg: 98.7 },
    { courses_dept: 'nurs', courses_avg: 98.71 },
    { courses_dept: 'nurs', courses_avg: 98.71 },
    { courses_dept: 'eece', courses_avg: 98.75 },
    { courses_dept: 'eece', courses_avg: 98.75 },
    { courses_dept: 'epse', courses_avg: 98.76 },
    { courses_dept: 'epse', courses_avg: 98.76 },
    { courses_dept: 'epse', courses_avg: 98.8 },
    { courses_dept: 'spph', courses_avg: 98.98 },
    { courses_dept: 'spph', courses_avg: 98.98 },
    { courses_dept: 'cnps', courses_avg: 99.19 },
    { courses_dept: 'math', courses_avg: 99.78 },
    { courses_dept: 'math', courses_avg: 99.78 } ] }

 ```