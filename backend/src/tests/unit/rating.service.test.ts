import ratingRepository from "../../modules/ratings/repositories/rating.repository";
import RatingService from "../../modules/ratings/services/rating.service";
import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";
import {
    BadRequestError,
    NotFoundError,
} from "../../shared/errors/http-errors";

describe("RatingService", () => {
    beforeEach(() => {
        ratingRepository.clear();
        userRepository.clear();
    });

    test("createRating throws when reviewee missing", async () => {
        const reviewer = new User("R", "One", "rev", "r@x.com");
        reviewer.setId("rev");
        userRepository.save(reviewer);

        await expect(
            RatingService.createRating("nope", "rev", { score: 5 }),
        ).rejects.toThrow(NotFoundError);
    });

    test("createRating persists rating and updates reputation", async () => {
        const reviewer = new User("R", "One", "rev", "r@x.com");
        reviewer.setId("rev");
        const reviewee = new User("E", "Two", "ee", "e@x.com");
        reviewee.setId("ee");
        userRepository.save(reviewer);
        userRepository.save(reviewee);

        const result = await RatingService.createRating("ee", "rev", {
            score: 4,
            comment: "ok",
        });

        expect(result.score).toBe(4);
        expect(result.revieweeId).toBe("ee");

        const saved = userRepository.findById("ee")!;
        expect(saved.reputation).toBe(4);
    });

    test("createRating throws BadRequestError when score missing", async () => {
        const reviewer = new User("R", "One", "rev", "r@x.com");
        reviewer.setId("rev");
        const reviewee = new User("E", "Two", "ee", "e@x.com");
        reviewee.setId("ee");
        userRepository.save(reviewer);
        userRepository.save(reviewee);

        // @ts-expect-error intentionally missing score
        await expect(
            RatingService.createRating("ee", "rev", {}),
        ).rejects.toThrow(BadRequestError);
    });
});
