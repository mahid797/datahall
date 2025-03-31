export const visitorFieldsConfig = {
	name: {
		label: 'Name',
		placeholder: 'Your Name',
		type: 'text',
	},
	email: {
		label: 'Email',
		type: 'email',
		placeholder: 'your_email@bluewave.com',
	},
	password: {
		label: 'Password',
		placeholder: '',
		type: 'password',
		helperText: 'Please enter the password shared with you',
	},
};

export const visitorFieldKeys = Object.keys(visitorFieldsConfig);
