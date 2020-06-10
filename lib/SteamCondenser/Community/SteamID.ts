import BigNum from 'bignum';

export class SteamID {
  public static ConvertCommunityIDToSteamID(communityID: number | BigNum): string {
    let comID = communityID;
    if (typeof comID === 'number') {
      comID = new BigNum(comID);
    }

    const steamID1 = comID.mod(2);
    const steamID2 = BigNum.sub(communityID, new BigNum('76561197960265728'));

    if (steamID2.le(0)) {
      throw new Error(`SteamID ${communityID} is too small.`);
    }

    return `STEAM_0:${steamID1}:${steamID2.sub(steamID1).div(2)}`;
  }

  public static ConvertCommunityIdToSteamId3(communityID: number | BigNum): string {
    let comID = communityID;
    if (typeof comID === 'number') {
      comID = new BigNum(comID);
    }

    const steamID1 = 1;
    const steamID2 = BigNum.sub(comID, new BigNum('76561197960265728'));

    if (steamID2.le(0)) {
      throw new Error(`SteamID ${comID} is too small.`);
    }

    return `[U:${steamID1}:${steamID2}]`;
  }

  public static ConvertSteamIdToCommunityId(steamID: string): BigNum {
    if (steamID === 'STEAM_ID_LAN' || steamID === 'BOT') {
      throw new Error(`Cannot convert SteamID "${steamID}" to a community ID.`);
    }

    if (steamID.match('^STEAM_[0-1]:[0-1]:[0-9]+$')) {
      const tmpId = steamID.substring(8).split(':');
      return new BigNum(Number.parseInt(tmpId[0], 10) + Number.parseInt(tmpId[1], 10) * 2).add('76561197960265728');
    } if (steamID.match('^\\[U:[0-1]:[0-9]+\\]+$')) {
      const tmpId = steamID.substring(3, steamID.length - 1).split(':');
      return new BigNum(Number.parseInt(tmpId[0], 10) + Number.parseInt(tmpId[1], 10)).add('76561197960265727');
    }

    throw new Error(`SteamID "${steamID}" doesn't have the correct format.`);
  }
}
