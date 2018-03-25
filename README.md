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
QUERY ::='{'BODY ', ' OPTIONS  (', ' TRANSFORMATIONS)? '}'

BODY ::= 'WHERE: {' (FILTER)? '}'
OPTIONS ::= 'OPTIONS: {' COLUMNS (', ' SORT)? '}'
TRANSFORMATIONS ::= 'TRANSFORMATIONS: {' GROUP ', ' APPLY '}'

FILTER ::= (LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION)

LOGICCOMPARISON ::= LOGIC ': [{' FILTER ('}, {' FILTER )* '}]'  
MCOMPARISON ::= MCOMPARATOR ': {' m_key ':' number '}'  
SCOMPARISON ::= 'IS: {' s_key ': ' [*]? inputstring [*]? '}'  
NEGATION ::= 'NOT: {' FILTER '}'

LOGIC ::= 'AND' | 'OR' 
MCOMPARATOR ::= 'LT' | 'GT' | 'EQ' 

COLUMNS ::= 'COLUMNS:[' (string ',')* string ']'
SORT ::= 'ORDER: ' ('{ dir:' DIRECTION ', keys: [ ' string (',' string)* ']}' | string) 
DIRECTION ::= 'UP' | 'DOWN'  

GROUP ::= 'GROUP: [' (key ',')* key ']'                                                          
APPLY ::= 'APPLY: [' (APPLYKEY (', ' APPLYKEY )* )? ']'  
APPLYKEY ::= '{' string ': {' APPLYTOKEN ':' key '}}'
APPLYTOKEN ::= 'MAX' | 'MIN' | 'AVG' | 'COUNT' | 'SUM'

key             ::= (s_key | m_key)
                    //semantics for each key detailed below

s_key           ::= ('courses_'('dept' | 'id' | 'instructor' |
                                'title' | 'uuid')) | 
                    ('rooms_'('fullname' | 'shortname' | 'number' | 
                              'name' | 'address' | 'type' | 
                              'furniture' | 'href'))           
m_key           ::= ('courses_'('avg' | 'pass' | 'fail' | 'audit' | 'year')) |
                    ('rooms_'('lat' | 'lon' | 'seats))      

inputstring     ::= [^*]+ //one or more of any character except asterisk.

```

## Query Examples

**Query A:**

Description: Find all rooms with more than 300 seats, and has "Tables" in the furniture description. Then, group all the rooms by the building they are in (rooms_shortname). For each of these groups, show the number of seats in the room with the most seats from that group. Show the groups' shortnames and the largest number of seats in the group, sorted by the largest number of seats in the group, largest to smallest.

```json

{
    "WHERE": {
        "AND": [{
            "IS": {
                "rooms_furniture": "*Tables*"
            }
        }, {
            "GT": {
                "rooms_seats": 300
            }
        }]
    },
    "OPTIONS": {
        "COLUMNS": [
            "rooms_shortname",
            "maxSeats"
        ],
        "ORDER": {
            "dir": "DOWN",
            "keys": ["maxSeats"]
        }
    },
    "TRANSFORMATIONS": {
        "GROUP": ["rooms_shortname"],
        "APPLY": [{
            "maxSeats": {
                "MAX": "rooms_seats"
            }
        }]
    }
}

```

**Response A:**

```
{
    "result": [{
        "rooms_shortname": "OSBO",
        "maxSeats": 442
    }, {
        "rooms_shortname": "HEBB",
        "maxSeats": 375
    }, {
        "rooms_shortname": "LSC",
        "maxSeats": 350
    }]
}

 ```

 **Query B:**

 Description: Find all courses with average of 97

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

**Response B:**

```
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

## Sidenotes

All zip files are used for testing purposes.