import {afterEach,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {sealToken,openToken,driveOAuthReady} from './drive-connection';
afterEach(()=>vi.unstubAllEnvs());
it('encrypts refresh tokens and rejects tampering or a different server key',()=>{vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test-server-key');const a=sealToken('test-refresh-token'),b=sealToken('test-refresh-token');expect(a).not.toBe(b);expect(a).not.toContain('test-refresh-token');expect(openToken(a)).toBe('test-refresh-token');const bytes=Buffer.from(a,'base64');bytes[30]^=1;expect(()=>openToken(bytes.toString('base64'))).toThrow();vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','different-key');expect(()=>openToken(a)).toThrow();});
it('does not advertise OAuth until all application credentials exist',()=>{vi.stubEnv('GOOGLE_CLIENT_ID','id');vi.stubEnv('GOOGLE_CLIENT_SECRET','');vi.stubEnv('GOOGLE_REDIRECT_URI','https://example.test/callback');expect(driveOAuthReady()).toBe(false);});
