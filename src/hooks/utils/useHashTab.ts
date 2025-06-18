'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps a string “tab key” in `location.hash` so the UI is shareable / reload-safe.
 *
 * @param defaultKey   fallback when no hash is present
 * @param allowedKeys  whitelist to avoid invalid states
 *
 * @returns  { tabKey, tabIndex, setTabKey }
 */
export function useHashTab<T extends string>(defaultKey: T, allowedKeys: readonly T[]) {
	const [tabKey, setTabKey] = useState<T>(() => {
		if (typeof window === 'undefined') return defaultKey;
		const fromHash = window.location.hash.replace('#', '') as T;
		return allowedKeys.includes(fromHash) ? fromHash : defaultKey;
	});

	/** write the hash whenever the key changes */
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const newHash = `#${tabKey}`;
		if (window.location.hash !== newHash) {
			window.history.replaceState(null, '', newHash);
		}
	}, [tabKey]);

	/** helper for MUI `<Tabs value={index}>` */
	const tabIndex = allowedKeys.indexOf(tabKey);

	return {
		tabKey,
		tabIndex,
		setTabKey,
	};
}

export default useHashTab;
