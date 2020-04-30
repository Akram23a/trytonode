const bcrypt = require('bcrypt');
const saltRounds = 10;

function encryption(clear)
{
	return bcrypt.hash(clear, saltRounds, function(err, hash);
}

