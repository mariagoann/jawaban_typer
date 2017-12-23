var Word = Backbone.Model.extend({
	move: function() {
		this.set({y:this.get('y') + this.get('speed')});
	}
});

var Words = Backbone.Collection.extend({
	model:Word
});

var WordView = Backbone.View.extend({
	initialize: function() {
		$(this.el).css({position:'absolute'});
		var string = this.model.get('string');
		var letter_width = 25;
		var word_width = string.length * letter_width;
		if(this.model.get('x') + word_width > $(window).width()) {
			this.model.set({x:$(window).width() - word_width});
		}
		for(var i = 0;i < string.length;i++) {
			$(this.el)
				.append($('<div>')
					.css({
						width:letter_width + 'px',
						padding:'5px 2px',
						'border-radius':'4px',
						'background-color':'#fff',
						border:'1px solid #ccc',
						'text-align':'center',
						float:'left'
					})
					.text(string.charAt(i).toUpperCase()));
		}
		
		this.listenTo(this.model, 'remove', this.remove);
		
		this.render();
	},
	
	render:function() {
		$(this.el).css({
			top:this.model.get('y') + 'px',
			left:this.model.get('x') + 'px'
		});
		var highlight = this.model.get('highlight');
		// var flag = this.model.get('flag');
		$(this.el).find('div').each(function(index,element) {
			if(index < highlight) {
				$(element).css({'font-weight':'bolder','background-color':'#aaa',color:'#fff'});
			} else {
				$(element).css({'font-weight':'normal','background-color':'#fff',color:'#000'});
			}
		});
	}
});

var TyperView = Backbone.View.extend({
	initialize: function() {
		var wrapper = $('<div>')
			.css({
				position:'fixed',
				top:'10',
				left:'0',
				width:'100%',
				height:'100%'
			});
		this.wrapper = wrapper;
		
		var self = this;
		// var buttonStop = $("<div class='but'><button id='stop'>STOP</button><button id='pause'>PAUSE</button><button id='resume'>RESUME</button></div>");
		var text_input = $('<input>')
			.addClass('form-control')
			.css({
				'border-radius':'4px',
				position:'absolute',
				top:'565px',
				// top:'0px',
				'min-width':'80%',
				width:'80%',
				'margin-bottom':'10px',
				'z-index':'1000'
			}).keyup(function() {
				var words = self.model.get('words');
				var flag =0;
				for(var i = 0;i < words.length;i++) {
					var word = words.at(i);
					var typed_string = $(this).val();
					var string = word.get('string');
					if(string.toLowerCase().indexOf(typed_string.toLowerCase()) == 0) {
						word.set({highlight:typed_string.length});
						if(typed_string.length == string.length) {
							$(this).val('');
							var node = document.createElement("LI");
						    var textnode = document.createTextNode("|");
						    node.appendChild(textnode);
						    document.getElementById("id_score").appendChild(node);
						    var score = $("#id_score li").length;
						 	document.getElementById("score").innerHTML='Score: '+score; 
						 }
						 // else{
					 	// 	var list = document.getElementById("id_score");
						 //    list.removeChild(list.childNodes[0]);
						 //    var score = $("#id_score li").length;
							// document.getElementById("score").innerHTML='Score: '+score; 
						 // }
					} else {
    					word.set({highlight:0});
					}
				}

			});
		
		$(this.el)
			.append(wrapper
				// .append(buttonStop)
				.append($('<form>')
					.attr({
						role:'form'
					})
					.submit(function() {
						return false;
					})
					.append(text_input)));
		
		text_input.css({left:((wrapper.width() - text_input.width()) / 2) + 'px'});
		text_input.focus();
		
		this.listenTo(this.model, 'change', this.render);
	},
	
	render: function() {
		var model = this.model;
		var words = model.get('words');
		
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			if(!word.get('view')) {
				var word_view_wrapper = $('<div>');
				this.wrapper.append(word_view_wrapper);
				word.set({
					view:new WordView({
						model: word,
						el: word_view_wrapper
					})
				});
			} else {
				word.get('view').render();
			}
		}
	}
});

var Typer = Backbone.Model.extend({
	defaults:{
		max_num_words:10, // old : 10
		min_distance_between_words:50,
		words:new Words(),
		min_speed:1,
		max_speed:5,
	},
	
	initialize:function(){

	},
	// initialize2: function() {
	// 	new TyperView({
	// 		model: this,
	// 		el: $(document.body)
	// 	});
	// },

	start: function() {
		var self = this;
		var animation_delay = 100; 
		/*Animation looks best at 60 fps (frames per second). 60fps is an update every ~16.7ms.
		With that in mind, you should use use 16 or 17 for your setInterval.
		https://stackoverflow.com/questions/31416723/how-to-smooth-out-setinterval-animation*/
		var counter;
		// alert(flag);

		new TyperView({
			model: this,
			el: $(document.body)
		});
		counter = setInterval(function() {
			self.iterate();
		},animation_delay);

		return counter;
		//batas
	},
	
	iterate: function() {
		var words = this.get('words');
		var count = 0;
		if(words.length < this.get('max_num_words')) {
			var top_most_word = undefined;
			for(var i = 0;i < words.length;i++) {
				var word = words.at(i);
				if(!top_most_word) {
					top_most_word = word;
				} else if(word.get('y') < top_most_word.get('y')) {
					top_most_word = word;
				}
			}
			
			if(!top_most_word || top_most_word.get('y') > this.get('min_distance_between_words')) {
				var random_company_name_index = this.random_number_from_interval(0,company_names.length - 1);
				var string = company_names[random_company_name_index];
				var filtered_string = '';
				for(var j = 0;j < string.length;j++) {
					if(/^[a-zA-Z()]+$/.test(string.charAt(j))) {
						filtered_string += string.charAt(j);
					}
				}
				
				var word = new Word({
					x:this.random_number_from_interval(0,$(window).width()),
					y:0,
					string:filtered_string,
					speed:this.random_number_from_interval(this.get('min_speed'),this.get('max_speed'))
				});
				words.add(word);
			}
		}
		
		var words_to_be_removed = [];
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			word.move();
			
			if(word.get('y') > $(window).height() || word.get('move_next_iteration')) {
				words_to_be_removed.push(word);
			}
			
			if(word.get('highlight') && word.get('string').length == word.get('highlight')) {
				word.set({move_next_iteration:true});
			}
		}

		for(var i = 0;i < words_to_be_removed.length;i++) {
			words.remove(words_to_be_removed[i]);
		}
		this.trigger('change');

	},
	
	random_number_from_interval: function(min,max) {
	    return Math.floor(Math.random()*(max-min+1)+min);
	}
});