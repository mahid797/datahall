import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Img } from '@react-email/img';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';

export const subject = 'Datahall | Reset your password';
export const label = 'Reset Password Email';

export function ResetPasswordEmail({ url }: { url: string }) {
	return (
		<Html>
			<Container
				style={{
					padding: '32px',
					fontFamily: 'sans-serif',
					backgroundColor: '#ffffff',
					maxWidth: '600px',
				}}>
				<Section style={{ textAlign: 'center', marginBottom: '24px' }}>
					<Img
						src='https://utfs.io/f/fYAncjDxKRb0SB5lSuLK58qIuaP0cF3tMzrJCA4G92LHNofp'
						width='100'
						alt='Bluewave Labs'
					/>
				</Section>

				<Heading
					as='h1'
					style={{
						fontSize: '24px',
						fontWeight: 'bold',
						marginBottom: '16px',
						textAlign: 'center',
					}}>
					Reset Your Password
				</Heading>

				<Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
					We received a request to reset your password. Click below to create a new one.
				</Text>

				<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
					<Button
						href={url}
						style={{
							backgroundColor: '#2563eb',
							color: '#ffffff',
							fontSize: '16px',
							padding: '12px 24px',
							borderRadius: '6px',
							textDecoration: 'none',
						}}>
						Reset Password
					</Button>
				</Section>

				<Text style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
					If you didn’t request a password reset, no action is needed.
				</Text>

				<Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

				<Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
					© {new Date().getFullYear()} Datahall. All rights reserved.
				</Text>
			</Container>
		</Html>
	);
}

export default ResetPasswordEmail;
