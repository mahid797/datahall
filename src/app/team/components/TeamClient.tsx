'use client';
import { useEffect, useState } from 'react';

import { Box, Button } from '@mui/material';

import { dummyTeams } from './dummyTeams';

import FilterToggle from './FilterToggle';
import UserTable from './UserTable';

import { useToast } from '@/hooks';

import { User } from '@/shared/models';
import { useModalContext } from '@/providers/modal/ModalProvider';

export default function TeamClient() {
	const { openModal } = useModalContext();
	const { showToast } = useToast();

	const [filterRole, setFilterRole] = useState<'All' | 'Administrator' | 'Member'>('All');
	const [page, setPage] = useState(1);
	const [users, setUsers] = useState<User[]>([]);
	const [totalUsers, setTotalUsers] = useState(0);
	const pageSize = 6;

	useEffect(() => {
		const fetchUsers = () => {
			const filteredUsers =
				filterRole === 'All' ? dummyTeams : dummyTeams.filter((user) => user.role === filterRole);

			setTotalUsers(filteredUsers.length);
			setUsers(filteredUsers.slice((page - 1) * pageSize, page * pageSize));
		};

		fetchUsers();
	}, [filterRole, page]);

	const handleFilterChange = (role: 'All' | 'Administrator' | 'Member') => {
		setFilterRole(role);
		setPage(1); // Reset to page 1 when the filter changes
	};

	const handleInvite = () => {
		openModal({
			type: 'inviteUser',
			contentProps: {
				title: 'Invite new team member',
				description: 'When you add a new team member, they will get access to all monitors.',
				onInvite: () => {
					console.log('Invitation sent successfully!');
					showToast({
						message: 'Invitation sent successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	return (
		<>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'>
				<FilterToggle
					currentFilter={filterRole}
					onFilterChange={handleFilterChange}
				/>
				<Button
					variant='contained'
					color='primary'
					onClick={handleInvite}>
					Invite team member
				</Button>
			</Box>
			<Box marginTop='2rem'>
				<UserTable
					users={users}
					page={page}
					setPage={setPage}
					filterRole={filterRole}
					pageSize={pageSize}
					totalUsers={totalUsers}
				/>
			</Box>
		</>
	);
}
