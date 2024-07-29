const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
    try {
        let following = await Follow.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })
            .exec();

        let followers = await Follow.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .exec();

        //Procesar array de identificadores para following
        let followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed);
        });

        //Procesar array de identificadores para followers
        let followersClean = [];

        followers.forEach(follow => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        }
    } catch (error) {
        return {};
    }

}

const followThisUser = async (identityUserId, profileUserId) => {
    //Sacar info de seguimiento
    let iFollowing = await Follow.findOne({ "user": identityUserId, "followed": profileUserId });

    let heFollower = await Follow.findOne({ "user": profileUserId, "followed": identityUserId });

    return {
        iFollowing,
        heFollower,
    };
}

module.exports = {
    followUserIds,
    followThisUser
}