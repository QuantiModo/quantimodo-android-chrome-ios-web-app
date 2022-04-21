# Quantimodo.Vote

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**causeVariableId** | **Number** | Cause variable id | 
**clientId** | **String** | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | 
**createdAt** | **String** | When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format | [optional] 
**effectVariableId** | **Number** | Effect variable id | 
**id** | **Number** | id | [optional] 
**updatedAt** | **String** | When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format | [optional] 
**userId** | **Number** | ID of User | 
**value** | **String** | Vote down for implausible/not-useful or up for plausible/useful. Vote none to delete a previous vote. | 
**type** | **String** | Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do | [optional] 


<a name="ValueEnum"></a>
## Enum: ValueEnum


* `up` (value: `"up"`)

* `down` (value: `"down"`)

* `none` (value: `"none"`)




<a name="TypeEnum"></a>
## Enum: TypeEnum


* `causality` (value: `"causality"`)

* `usefulness` (value: `"usefulness"`)




