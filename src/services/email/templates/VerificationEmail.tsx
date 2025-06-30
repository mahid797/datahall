import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Img } from '@react-email/img';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';

export const subject = 'Datahall | Confirm your email address';

export const label = 'Verification Email';

export function VerificationEmail({ url, name }: { url: string; name?: string }) {
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
					{name ? `Welcome, ${name}!` : 'Welcome to Bluewave Labs'}
				</Heading>

				<Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
					Thanks for signing up! Please confirm your email address to complete your registration.
				</Text>

				<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
					<Button
						href={url}
						style={{
							backgroundColor: '#2563eb', // Tailwind Blue-600
							color: '#ffffff',
							fontSize: '16px',
							padding: '12px 24px',
							borderRadius: '6px',
							textDecoration: 'none',
						}}>
						Confirm Email
					</Button>
				</Section>

				<Text style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
					If you didn’t create an account, you can safely ignore this email.
				</Text>

				<Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

				<Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
					© {new Date().getFullYear()} Datahall. All rights reserved.
				</Text>
			</Container>
		</Html>
	);
}

export default VerificationEmail;
