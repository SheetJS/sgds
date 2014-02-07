# simplegdocserver

Simple REST Server that emulates Google Docs interface using your Excel files.
(currently read-only)

## Installation

(requires node + npm)

```
npm install -g simplegdocserver
```

## Usage

To host files from the current directory, on port 7263: 

```
$ simplegdocserver
```

To use a different port, either set the PORT environment variable or pass it
as an argument:

```
$ simplegdocserver 8000
```

To host from a different directory, pass a third argument or set the BASE_DIR
environment variable:

```
$ simplegdocserver 8000 ./test_files
```

## Interaction with Client Libraries

Using [tabletop](https://github.com/jsoma/tabletop), just set the endpoint:

```
   Tabletop.init( {
     endpoint:"http://localhost:7263", // <-- adjust based on server settings 
     key: "myfile.xls", // <-- the actual filename
     ...
   });
```

The demo directory includes a demo using [mapsheet](https://github.com/jsoma/mapsheet) to annotate a map.

## Notes

*there is no caching*.  This is intentional: you can quickly change your data
in Excel and simplegdocserver will immediately see the change.
