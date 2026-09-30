// React 19 act() environment must be set before any React imports
// This file runs via setupFiles (before test framework), ensuring the flag
// is set before React loads.
global.IS_REACT_ACT_ENVIRONMENT = true;
