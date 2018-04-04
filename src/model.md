# Model

This constructs the code for dealing with models. This creates two different
Models, one for the server and one for the browser. There is a lot of overlap,
but they have some differences in saving, etc. 


The Model object handles all the (not just a file) data storage and manipulation in memory. It
calls out when needing to load, save, etc. 

A model is first and foremost an array of records. Each record has an id
number and that is the array number. This leads to simple access. References
everywhere are based on the ids. 

In addition, each model has a parent (either an array of other models if a
derived thing or something, like a string, pointing to where it is stored) and
children (an array based off of a join that is constructed for this). 

Each model has a header object that maps the array indices in the record to a
header. Insert header to get the index then look up the index in a row. 

The methods on a model include  create/read (find)/update/delete. Their
signatures and basic operations are as follows: 

a. Create ([rows]/row) Each row is an object with header:value. This inserts
the row(s) and returns id(s). 
b. Read (find, filter) This takes in a find function or finding string to
narrow the records and a filter function or string that affects what values
are returned (and it can transform them). The function forms expect a row; the
find will return true or false; the filter returns a row. 
c. Update ([rows]/row) Each row must contain an id along with the rest of the
info. 
d. Delete ([row ids]/row id) Just an id or ids. 

Those are generic functions. We also have generic functions for logging and
saving, both of which can be replaced with a noop to avoid the default or
replace the default with whatever should happen. The call to the log is done
before the saving. 

The Model object has two functions for creating new models: load will load a
model from a csv file while join takes existing models
and combines them into a new model. Join can also just be a filtered version
of a parent.  

    Model.load('temp');
    Model.create('temp', rows);

We are using csv files and not worrying about a future migration to a db
structure because if we need a db, then we need to avoid stuff in memory for
scale (otherwise, we can stick with csv). 

## Core

    const Model = {
        tables : new Set(), 
        models : {
        },
        async $load(table = '') { _"load"
        },
        async $join(table, parents=[], options={}) { _"join"
        },
        async $create(table, rows=[]) {_"create"
        },
        async $read(table, find='*', filter='*') {_"read"
        },
        async $update(table, rows=[]) {_"update"
        },
        async $delete(table, rows=[]) {_"delete"
        },
        async $save(table) {_"save"
        },
        async $log(table) {_"log"
        },
        async $error(name, data), {_"error"}
    };

## Load

This loads the data into a new object. It takes in `fname` which will say what
resource to load. The resources object in Model contains the method to load
the requested object. After loading, we should have an array of arrays with
the first array being the headers. We convert that into an object for where to
locate the desired headings when needed. 


    const Model = this;

    _":path checking"

    try {
        let arrs = await csv.$load(table);
        const headrow = arrs.shift();
        const headers = {};
        head.forEach( (heading, ind) {
            headers[heading] = ind;
        });

        return (Model.models[table] = { headers, headrow,  arrs});
    } catch (e) {
        Model.error('load', `table ${table} failed to load`, e); 
        throw Error(e);
    }

    
[path checking]()

We check for an empty name as well as normalize the path to keep it safe. 

For a table name to be valid it should be in the tables column. Generally,
this is loaded with access.csv loading. 

We check for the existence of the table before path checking because we want
to call load a lot and make it return quickly. We check again after the path
has been normalized. This also allows for join tables to have funky names. 

We use a `.` in front of a table name to indicate a join table. If the join
table does not exist and is not defined in the joins, then there will be an
error in processing and the error will throw (the joins[0] will error in that
case). 



    if (Model.models.hasOwnProperty(table)) {
        return Model.models[table];
    }
    
    //
    if (table[0] === '.') {
        let joins = Mode.joins[table];
        try {
            return Model.$join(table, joins[0], joins[1]);
        } catch (e) {
            Model.error('load', `table joining failed ${table}`, e);
            throw Error(e);
        } 
    }

    table = safepath(table); 

    if (! Models.tables.has(fname) ) {
        Model.error('load',  `table ${fname} does not exist`);
        throw Error(e);
    }

    if (Model.models.hasOwnProperty(table)) {
        return Model.models[table];
    }
    

    

    
## Join

The join function takes multiple tables and joins them and filters/transforms
the row entries. The join function should not be called directly; call load. 

It expects a table name and a parents array. It also takes an options object:

* `join` Evaluates each combination of rows and decides whether to accept or
  reject them. Default: join on headers with the same name. If no common name,
  then all rows match (not a good idea).
* `headers` This is an array that lists the desired headers in the output, in
  the desired order. Any header that does not appear on this list does not
  appear in the result (whitelist). If none is provided, this is constructed
  from the parent ordering of the orders and skips any repeat headers. If a
  filter is provided, this should be as well, but if it is not, it will use
  this algorithm, but also skip any headers not present in the filtered
  result. 
* `filter` This can filter and transform the rows. The input into the function
  is an array of matched rows, one entry per parent. The filter should return
  an object with the heading map to value. This is then converted into a row
  per the ordering, but this is done after the filtering. 
* `create`, `update`, `delete` are somewhat inappropriate on joins, but they
  are useful nonetheless. One can provide these optional functions to enact
  these operations on the parents. 

And now here is the function. We first load all the parent tables. The load
function returns the actual parents. Join objects also have the raw row ids as
the id; these are in parent order and is how these rows are referenced. If the
joining puts multiple rows combined into one, then the ids are put in as an
array. 


    parents = await Promise.all(parents.map( (par) => Model.$load(par) )); 

    _":defaults"

    return Model.models[table] = 


[defaults]()

    const join = options.join || (rows) => {
            
    };



## Create

## Read

## Update

## Delete

## Save

## Log

## Error


