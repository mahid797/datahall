import { Box, Typography } from '@mui/material';
import React from 'react';

import { CustomCheckbox, FormInput } from '@/components';

interface Props {
	formValues: any;
	handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LinkDetailsAccordion = ({ formValues, handleInputChange }: Props) => {
	return (
		<Box py={2}>
			{/* <Typography variant='body1'>Link URL</Typography>
			<Typography
				variant='body2'
				mb={5}>
				This is an automatically generated link address.
			</Typography>

			<Box
				display='flex'
				alignItems='center'
				justifyContent='space-between'>
				<FormInput
					id='generatedLink'
					minWidth={460}
					value='https://app.bluewavelabs.ca/settings/general'
					onChange={() => {}}
					placeholder=''
				/>
				<IconButton size='large'>
					<CopyIcon />
				</IconButton>
			</Box> */}

			<Box
				display='flex'
				flexDirection='column'
				my={2}
				gap={2}>
				<Typography>Link name</Typography>
				<FormInput
					id='alias'
					minWidth={460}
					type='text'
					value={formValues.alias}
					onChange={handleInputChange}
					placeholder='Enter a friendly name for the link'
				/>

				<CustomCheckbox
					sx={{ my: 4, ml: 2 }}
					checked={formValues.isPublic}
					onChange={handleInputChange}
					name='isPublic'
					label='Allow anyone with this link to preview and download'
				/>
			</Box>
		</Box>
	);
};

export default LinkDetailsAccordion;
