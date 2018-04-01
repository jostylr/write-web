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
model from an external resource (csv file) while join takes existing models
and combines them into a new model. Join can also just be a filtered version
of a parent.  