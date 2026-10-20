// The ONLY file the screens use to talk to the backend.
// USE_FAKE_API = true  -> fake.js (works with no server, data resets on reload)
// USE_FAKE_API = false -> real.js (the Laravel backend at API_URL)
// Both files have the same functions, so the screens never change.

import { USE_FAKE_API } from '../config';
import * as fake from './fake';
import * as real from './real';

const api = USE_FAKE_API ? fake : real;

export default api;
export { ApiError } from './errors';
