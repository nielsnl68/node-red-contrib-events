module.exports = function(RED) {
    "use strict";
 
   var eventTasks = {
			outstandingTimers :[], 
			DispatchNodes : [],
			dispatch : function (msg) { 
				for (var i=0;i<eventTasks.DispatchNodes.length;i++) {
					eventTasks.DispatchNodes[i].emit("input", msg);
				}
			},
			setTimeout: function () {
                var func = arguments[0];
                var timerId;
                arguments[0] = function() {
                    eventTasks.clearTimeout(timerId);
          //          console.log('Event fired');

                    try {
                        func.apply(this,arguments);
                    } catch(err) {
                        node.error(err,{});
                    }
                };
                timerId = setTimeout.apply(this,arguments);
                eventTasks.outstandingTimers.push(timerId);
                return timerId;
            },
            clearTimeout: function(id) {
                clearTimeout(id);
                var index = eventTasks.outstandingTimers.indexOf(id);
                if (index > -1) {
                    eventTasks.outstandingTimers.splice(index,1);
                }
            }
		}
 
    // The Output Node
    function addingEvent(n) {
      RED.nodes.createNode(this, n);
      var node = this;

      node.on("input", function(msg) {
        if (msg.delay == undefined || msg.delay == 0) {
  			  msg.delay = 0;
  		  }
  			eventTasks.setTimeout(eventTasks.dispatch, msg.delay, msg);
  //      console.log(JSON.stringify(eventTasks.outstandingTimers));
      });

      node.on("close", function() {
            //   node.port.free();
        while (eventTasks.outstandingTimers.length > 0) {
          clearTimeout(node.outstandingTimers.pop())
        }			
      });
    }
    RED.nodes.registerType("Add task", addingEvent);	
	
    // The Input Node
    function eventDispatcher(n) {
        RED.nodes.createNode(this,n);
        var node = this;
//        
        eventTasks.DispatchNodes.push(node);
        node.on("input", function(msg) {
		       node.send(msg);
		       msg = null;
        });


        node.on("close", function() {
            //   node.port.free();
  				for (var i=0;i<eventTasks.DispatchNodes.length;i++) {
  					if (eventTasks.DispatchNodes[i].id === node.id) {
               eventTasks.DispatchNodes.splice(i,1);
            };
  				}
          
          this.log('this is closed now');
          
        });
       // this.log(JSON.stringify(eventTasks));
        
    }
    RED.nodes.registerType("Do task", eventDispatcher);


}
