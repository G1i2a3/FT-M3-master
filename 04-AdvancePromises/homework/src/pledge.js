'use strict';
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:

function $Promise(executor){      // puede ser llamado con una argumento de función (el "executor"), devolviendo una nueva instancia de promesa
  if (typeof executor !== 'function') throw new TypeError ('executor must be a function')     // arroja un error descriptivo si es llamado sin función como argumento

  this._state = 'pending'     // comienza con un estado interno "pending"
  this._handlerGroups = []
  executor(this._internalResolve.bind(this), this._internalReject.bind(this))    //es llamada cuando hacemos una nueva $Promise  //es llamado con dos funciones distintas (funception!), resolve y reject
}

$Promise.prototype._internalResolve = function(data){  //tiene un método de instancia `._internalResolve`
  if (this._state === 'pending'){   //no afecta una promesa ya completada
    this._state = 'fulfilled'   //cambia el estado de la promesa a "fulfilled"
    this._value = data    //puede enviar data a la promesa para almacenamiento
    this._callHandlers()
  }
}      

$Promise.prototype._internalReject = function(reason){  //tiene un método de instancia `._internalReject`
  if (this._state === 'pending'){   //no afecta una promesa ya completada
    this._state = 'rejected'   //cambia el estado de la promesa a "rejected"
    this._value = reason    //puede enviar reason a la promesa para almacenamiento
    this._callHandlers()
  }
}    

$Promise.prototype.then = function(successCb, errorCb){   //agrega grupos de handlers (funciones callbacks) a la promesa //puede ser llamado multiples veces para añadir mas handlers
 if (typeof successCb !== 'function') successCb = false   //agrega un valor falso en lugar de callbacks que no son funciones en el success o error
 if (typeof errorCb !== 'function') errorCb = false 
 
 const downstreamPromise = new $Promise(function(){})   // `.then` agregá una nueva promesa a su handlerGroups
 
 this._handlerGroups.push({
    successCb,
    errorCb,
    downstreamPromise
  })
  if(this._state !== 'pending'){
    this._callHandlers()
  }

  return downstreamPromise   // `.then` devuelve ese downstreamPromise

}

$Promise.prototype._callHandlers = function(){
  while(this._handlerGroups.length){
    var handler = this._handlerGroups.shift()
    if(this._state === 'fulfilled'){
      //handler.successCb && handler.successCb(this._value)
      if(!handler.successCb){
        handler.downstreamPromise._internalResolve(this._value)
      }else{
        try {
          const result = handler.successCb(this._value)
          // si arroja un error va al catch 
          // Y NO LEEE NADA MAS DE LO QUE HAYA DENTRO DEL TRY
          // result es una promesa??
          if(result instanceof $Promise){
            result.then(value => {
              handler.downstreamPromise._internalResolve(value)
            }, err => {
              handler.downstreamPromise._internalReject(err)
            })
          }else {
            // es un valor!
            handler.downstreamPromise._internalResolve(result)
          }
        } catch (error) {
          handler.downstreamPromise._internalReject(error)
        }
      }
    }else{
      //handler.errorCb && handler.errorCb(this._value)
      if (!handler.errorCb){
        handler.downstreamPromise._internalReject(this._value)
      }else {
        try {
          const result = handler.errorCb(this._value)
          if(result instanceof $Promise){
            result.then(value => {
              handler.downstreamPromise._internalResolve(value)
            }, err => {
              handler.downstreamPromise._internalReject(err)
            })
          }else {
            handler.downstreamPromise._internalResolve(result)
          }
        } catch (error) {
          handler.downstreamPromise._internalReject(error)          
        }
      }
    }
  }
}


//llama al success handles agregado por `.then`
//llama un success handler pasando el valor de la promesa
//llama a cada success handler, una vez por cada adhesión
//llama cada success handler cuando es añadido

$Promise.prototype.catch = function(errorCb){   //adjunta la función pasada como un error handler
  return this.then(null, errorCb)    //devuelve lo mismo que .then devolvería
}

// ------------------------ HASTA ACA: CAP 1, 2, 3, Y 4 HECHOS!---------------------

module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
