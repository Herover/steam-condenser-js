import BigNum from 'bignum';
import { SteamID } from '../../lib/SteamCondenser/Community/SteamID';

describe('SteamID', () => {
  it('should be able to convert a community ID to a steam ID', async () => {
    let val = SteamID.ConvertCommunityIDToSteamID(new BigNum('76561197960290418'));
    expect(val).toBe('STEAM_0:0:12345');

    val = SteamID.ConvertCommunityIDToSteamID('76561197960290418');
    expect(val).toBe('STEAM_0:0:12345');
  });

  it('should be able to convert a community ID to a steam ID 3', async () => {
    let steamId = SteamID.ConvertCommunityIdToSteamId3(new BigNum('76561197960497430'));
    expect(steamId).toBe('[U:1:231702]');

    steamId = SteamID.ConvertCommunityIdToSteamId3(new BigNum('76561197998273743'));
    expect(steamId).toBe('[U:1:38008015]');

    steamId = SteamID.ConvertCommunityIdToSteamId3(new BigNum('76561198000009691'));
    expect(steamId).toBe('[U:1:39743963]');
  });

  it('should be able to convert a steam ID to a community ID', async () => {
    const steamId64 = SteamID.ConvertSteamIdToCommunityId('STEAM_0:0:12345');
    expect(steamId64).toStrictEqual(new BigNum('76561197960290418'));
  });

  it('should be able to convert a universe steam ID to a community ID', async () => {
    let steamId64 = SteamID.ConvertSteamIdToCommunityId('[U:1:12345]');
    expect(steamId64).toStrictEqual(new BigNum('76561197960278073'));

    steamId64 = SteamID.ConvertSteamIdToCommunityId('[U:1:39743963]');
    expect(steamId64).toStrictEqual(new BigNum('76561198000009691'));
  });
});
