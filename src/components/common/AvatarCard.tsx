import { Avatar, Box, Link } from '@mui/material';
import { PencilIcon } from '@/icons';
import { MouseEvent } from 'react';

interface AvatarActionsProps {
	/** Image URL (optional). If absent, initials are shown. */
	src?: string;
	/** Fallback initials when no image. Example: "BU" */
	initials?: string;
	/** Diameter in px (default 64) */
	size?: number;
	/** Called when user clicks Delete link */
	onDelete?: (event: MouseEvent) => void;
	/** Called when user clicks Update link OR the hover overlay */
	onUpdate?: (event: MouseEvent) => void;
	/** Disable editing UI (e.g. when form is not in edit mode) */
	disabled?: boolean;
}

export default function AvatarActions({
	src,
	initials = '',
	size = 64,
	onDelete,
	onUpdate,
	disabled = false,
}: AvatarActionsProps) {
	const linkStyle = disabled ? { pointerEvents: 'none', opacity: 0.5 } : {};

	return (
		<Box
			display='flex'
			alignItems='center'>
			{/* Avatar + Hover overlay */}
			<Box
				sx={{
					position: 'relative',
					width: size,
					height: size,
					mr: 2,
					borderRadius: '50%',
					overflow: 'hidden',
					'&:hover .avatar-edit-icon': { opacity: disabled ? 0 : 1 },
				}}>
				<Avatar
					alt='Avatar'
					src={src}
					sx={{
						width: '100%',
						height: '100%',
						bgcolor: '#EDEEF1',
						color: 'text.brand',
						fontSize: size * 0.55,
						fontWeight: 600,
						cursor: disabled ? 'default' : 'pointer',
					}}>
					{src ? null : initials}
				</Avatar>

				{onUpdate && (
					<Box
						className='avatar-edit-icon'
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: 'rgba(0,0,0,0.15)',
							opacity: 0,
							transition: 'opacity 0.3s',
							cursor: 'pointer',
						}}
						onClick={disabled ? undefined : onUpdate}>
						<PencilIcon
							width={size * 0.3}
							height={size * 0.3}
							color='white'
						/>
					</Box>
				)}
			</Box>

			{/* Action links */}
			{onDelete && (
				<Link
					href='#'
					underline='hover'
					pl={2}
					color='text.secondary'
					onClick={onDelete}
					sx={linkStyle}>
					Delete
				</Link>
			)}
			{onUpdate && (
				<Link
					href='#'
					underline='hover'
					px={2}
					onClick={onUpdate}
					sx={linkStyle}>
					Update
				</Link>
			)}
		</Box>
	);
}
