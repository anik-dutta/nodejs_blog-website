/* 			Blog website		 */

// external imports
const express = require('express');
const mongoose = require('mongoose');

// starting app
const app = express();

// serving static files
app.use(express.static('public'));

// view engine setup
app.set('view engine', 'ejs');

// parser
app.use(express.urlencoded({ extended: true }));

// establish database connection
mongoose.connect('mongodb://localhost:27017/blogDB')
	.then(() => {
		console.log('Connected to the database successfully!')
	}).catch((error) => {
		console.log(error.message)
	});

// creating schema
const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Add a name to your post']
	},
	content: {
		type: String,
		required: true
	},
	date: { type: String }
});

// creating model
const Post = mongoose.model('Post', postSchema);

// routes
app.get('/', async function (req, res) {
	try {
		const posts = await Post.find();
		res.render('home', { posts: posts });
	} catch (error) {
		res.render('error', { error: 'There was an error!' });
	}
});

app.get('/about', function (req, res) {
	res.render('about');
});

app.get('/contact', function (req, res) {
	res.render('contact');
});

app.get('/compose', function (req, res) {
	res.render('compose');
});

app.get('/posts/:postId', async function (req, res) {
	const requestedPostId = req.params.postId;
	try {
		const post = await Post.findOne({ _id: requestedPostId });
		res.render('post',
			{
				title: post.title,
				content: post.content,
				date: post.date
			});
	} catch (error) {
		res.render('error', { error: 'There was an error on the server side!' });
	}
});

app.post('/compose', function (req, res) {
	const today = new Date();
	const options = {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	};
	const currentdate = today.toLocaleString('en-US', options);

	let hour = today.getHours();
	let minute = today.getMinutes();
	let second = today.getSeconds();
	let am_pm = 'AM';

	if (hour > 12) {
		hour -= 12;
		am_pm = 'PM';
	}
	if (hour == 0) {
		hour = 12;
		am_pm = 'AM';
	}

	hour = hour < 10 ? '0' + hour : hour;
	minute = minute < 10 ? '0' + minute : minute;
	second = second < 10 ? '0' + second : second;
	const currentTime = hour + ':' + minute + ':' + second + ' ' + am_pm;
	const date = currentTime + ', ' + currentdate;
	try {
		const post = new Post({
			title: req.body.postTitle,
			content: req.body.postBody,
			date: date
		});

		Post.create(post);
		res.redirect('/');
	} catch (error) {
		res.render('error', { error: 'There was an error on the server side!' });
	}
});

// port setup
const PORT = process.env.PORT || 3000;

// run app on port
app.listen(PORT, function () {
	console.log(`Server started on port ${PORT}...`);
});