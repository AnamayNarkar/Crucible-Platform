package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import com.crucible.platform.v1.dto.contest.ContestDetailsForUser;
import com.crucible.platform.v1.dto.contest.CreateContest;
import com.crucible.platform.v1.dto.contest.UpdateContest;
import com.crucible.platform.v1.dto.contest.ManageContestResponse;
import com.crucible.platform.v1.dto.contest.ContestQuestionsResponse;
import com.crucible.platform.v1.dto.contest.ContestQuestionsDto;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.user.UserSummaryDto;
import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.entity.UserContest;
import com.crucible.platform.v1.entity.ContestAdmin;
import com.crucible.platform.v1.exceptions.ForbiddenException;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.exceptions.UnauthorizedAccessException;
import com.crucible.platform.v1.repository.ContestAdminRepository;
import com.crucible.platform.v1.repository.ContestRepository;
import com.crucible.platform.v1.repository.QuestionRepository;
import com.crucible.platform.v1.repository.UserContestRepository;
import com.crucible.platform.v1.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContestService {
  private final ContestRepository contestRepository;
  private final ContestAdminRepository contestAdminRepository;
  private final QuestionRepository questionRepository;
  private final UserRepository userRepository;
  private final UserContestRepository userContestRepository;

  public ContestService(ContestRepository contestRepository,
      ContestAdminRepository contestAdminRepository, QuestionRepository questionRepository,
      UserRepository userRepository, UserContestRepository userContestRepository) {
    this.contestAdminRepository = contestAdminRepository;
    this.contestRepository = contestRepository;
    this.questionRepository = questionRepository;
    this.userRepository = userRepository;
    this.userContestRepository = userContestRepository;
  }

  public Mono<ResponseEntity<ManageContestResponse>> getContestForManagement(Long contestId, Long userId) {
    // Fetch contest and contest admins in parallel
    Mono<Contest> contestMono = contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")));

    Mono<List<ContestAdmin>> adminsMono = contestAdminRepository.findByContestId(contestId)
        .collectList();

    // Combine both results and check authorization
    return Mono.zip(contestMono, adminsMono)
        .flatMap(tuple -> {
          if (tuple.getT1() == null) {
            return Mono.error(new NotFoundException("Contest not found"));
          }

          Contest contest = tuple.getT1();
          List<ContestAdmin> contestAdmins = tuple.getT2();

          // Check if user is the creator or an admin
          boolean isCreator = contest.getCreatorId().equals(userId);
          boolean isAdmin = contestAdmins.stream()
              .anyMatch(admin -> admin.getAdminId().equals(userId));

          if (!isCreator && !isAdmin) {
            return Mono.error(new ForbiddenException("You do not have permission to manage this contest"));
          }

          // User is authorized, fetch questions and admin user details
          
          // FIX: Use questionRepository.findByContestId directly
          Mono<List<Question>> questionsMono = questionRepository.findByContestId(contestId)
              .collectList();

          Mono<List<UserSummaryDto>> adminUsersMono = Flux.fromIterable(contestAdmins)
              .flatMap(admin -> userRepository.findById(admin.getAdminId()))
              .map(user -> new UserSummaryDto(
                  user.getId().toString(),
                  user.getUsername(),
                  user.getEmail()))
              .collectList();

          // Combine questions and admin users
          return Mono.zip(questionsMono, adminUsersMono)
              .map(data -> {
                List<Question> questions = data.getT1();
                List<UserSummaryDto> adminUsers = data.getT2();

                ManageContestResponse response = new ManageContestResponse();
                response.setContest(contest);
                response.setAdmins(adminUsers.toArray(new UserSummaryDto[0]));
                response.setQuestions(questions.toArray(new Question[0]));

                return new ResponseEntity<>(response, "Contest management data retrieved successfully");
              });
        });
  }

  public Mono<ResponseEntity<List<Contest>>> getUserManagedContests(Long userId) {
    // Fetch contests where user is creator
    Flux<Contest> contestsAsCreator = contestRepository.findByCreatorId(userId);

    // Fetch contests where user is admin
    Flux<Contest> contestsAsAdmin = contestAdminRepository.findByAdminId(userId)
        .map(ContestAdmin::getContestId)
        .flatMap(contestRepository::findById);

    // Merge and distinct to avoid duplicates if user is both creator and admin
    return Flux.merge(contestsAsCreator, contestsAsAdmin)
        .distinct()
        .collectList()
        .map(contests -> new ResponseEntity<>(contests, "User managed contests retrieved successfully"));
  }

  public Mono<ResponseEntity<Contest>> createContest(WebSession session, CreateContest dto) {
    Long userId = (Long) session.getAttributes().get("userId");
    // This constructor assumes your Contest entity matches the migration
    // (including banner_image_url and card_description)
    Contest contest = new Contest(
        null, 
        dto.getName(), 
        dto.getBannerImageUrl(), 
        dto.getCardDescription(),
        dto.getMarkdownDescription(), 
        userId, 
        dto.getStartTime(), 
        dto.getEndTime(), 
        null, 
        null
    );
    return contestRepository.save(contest)
        .map(savedContest -> new ResponseEntity<>(savedContest, "Contest created successfully"));
  }

  public Mono<ResponseEntity<List<Contest>>> getOngoingContests() {
    LocalDateTime now = LocalDateTime.now();
    return contestRepository.findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(now, now)
        .collectList()
        .map(contests -> new ResponseEntity<>(contests, "Ongoing contests retrieved successfully"));
  }

  public Mono<ResponseEntity<List<Contest>>> getUpcomingContests() {
    LocalDateTime now = LocalDateTime.now();
    return contestRepository.findByStartTimeGreaterThanEqual(now)
        .collectList()
        .map(contests -> new ResponseEntity<>(contests, "Upcoming contests retrieved successfully"));
  }

  public Mono<ResponseEntity<List<Contest>>> getPastContests() {
    LocalDateTime now = LocalDateTime.now();
    return contestRepository.findByEndTimeLessThanEqual(now)
        .collectList()
        .map(contests -> new ResponseEntity<>(contests, "Past contests retrieved successfully"));
  }

  public Mono<ResponseEntity<Contest>> updateContest(Long contestId, Long userId, UpdateContest dto) {
    // First, fetch the contest and verify authorization
    Mono<Contest> contestMono = contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")));

    Mono<List<ContestAdmin>> adminsMono = contestAdminRepository.findByContestId(contestId)
        .collectList();

    return Mono.zip(contestMono, adminsMono)
        .flatMap(tuple -> {
          Contest contest = tuple.getT1();
          List<ContestAdmin> contestAdmins = tuple.getT2();

          // Check if user is the creator or an admin
          boolean isCreator = contest.getCreatorId().equals(userId);
          boolean isAdmin = contestAdmins.stream()
              .anyMatch(admin -> admin.getAdminId().equals(userId));

          if (!isCreator && !isAdmin) {
            return Mono.error(new ForbiddenException("You do not have permission to update this contest"));
          }

          // Update fields
          if (dto.getCardDescription() != null) {
            contest.setCardDescription(dto.getCardDescription());
          }
          if (dto.getMarkdownDescription() != null) {
            contest.setMarkdownDescription(dto.getMarkdownDescription());
          }
          
          // Only creator can update these fields
          if (isCreator) {
            if (dto.getName() != null) {
              contest.setName(dto.getName());
            }
            if (dto.getBannerImageUrl() != null) {
              contest.setBannerImageUrl(dto.getBannerImageUrl());
            }
            if (dto.getStartTime() != null) {
              contest.setStartTime(dto.getStartTime());
            }
            if (dto.getEndTime() != null) {
              contest.setEndTime(dto.getEndTime());
            }
          }

          // Save the updated contest
          return contestRepository.save(contest)
              .map(updatedContest -> new ResponseEntity<>(updatedContest, "Contest updated successfully"));
        });
  }

  public Mono<ResponseEntity<Void>> deleteContest(Long contestId, Long userId) {
    return contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
        .flatMap(contest -> {
          if (!contest.getCreatorId().equals(userId)) {
            return Mono.error(new UnauthorizedAccessException("Only the creator can delete this contest"));
          }
          return contestRepository.delete(contest)
              .then(Mono.just(new ResponseEntity<Void>(null, "Contest deleted successfully")));
        });
  }

  public Mono<ResponseEntity<Void>> joinContest(Long contestId, Long userId) {
    return contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
        .flatMap(contest -> {
          UserContest userContest = new UserContest();
          userContest.setUserId(userId);
          userContest.setContestId(contestId);
          return userContestRepository.save(userContest)
              .then(Mono.just(new ResponseEntity<>(null, "Successfully joined contest")));
        });
  }

  public Mono<ResponseEntity<ContestDetailsForUser>> getContestById(Long userId, Long contestId) {
    return contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
        .flatMap(contest -> {
          return userContestRepository.findByUserIdAndContestId(userId, contestId)
              .doOnNext(userContest -> System.out.println("UserContest found: " + userContest))
              .switchIfEmpty(Mono.defer(() -> {
                System.out.println("No UserContest found for userId: " + userId + ", contestId: " + contestId);
                return Mono.empty();
              }))
              .hasElement()
              .map(hasParticipated -> {
                ContestDetailsForUser dto = new ContestDetailsForUser(
                    contest.getId(),
                    contest.getName(),
                    contest.getBannerImageUrl(),
                    contest.getCardDescription(),
                    contest.getMarkdownDescription(),
                    contest.getCreatorId(),
                    contest.getStartTime(),
                    contest.getEndTime(),
                    contest.getCreatedAt(),
                    contest.getUpdatedAt(),
                    hasParticipated
                );
                return new ResponseEntity<>(dto, "Contest retrieved successfully");
              });
        });
  }

  public Mono<ResponseEntity<ContestQuestionsResponse>> getContestQuestions(Long contestId, Long userId) {
    // Fetch the contest
    return contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
        .flatMap(contest -> {
          // Check if user has participated in the contest
          return userContestRepository.findByUserIdAndContestId(userId, contestId)
              .hasElement()
              .flatMap(hasParticipated -> {
                // Fetch questions for the contest
                return questionRepository.findByContestId(contestId)
                    .map(question -> new ContestQuestionsDto(
                        question.getId(),
                        question.getTitle(),
                        question.getPoints()
                    ))
                    .collectList()
                    .map(questions -> {
                      ContestQuestionsResponse response = new ContestQuestionsResponse(
                          contest.getId(),
                          contest.getName(),
                          hasParticipated,
                          questions
                      );
                      return new ResponseEntity<>(response, "Contest questions retrieved successfully");
                    });
              });
        });
  }

  public Mono<ResponseEntity<Void>> participateInContest(Long contestId, Long userId) {
    // Fetch contest
    Mono<Contest> contestMono = contestRepository.findById(contestId)
        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")));

    // Check if user is creator
    Mono<Boolean> isCreatorMono = contestMono
        .map(contest -> contest.getCreatorId().equals(userId));

    // Check if user is admin
    Mono<Boolean> isAdminMono = contestAdminRepository.findByContestId(contestId)
        .any(admin -> admin.getAdminId().equals(userId));

    // Check if already participated
    Mono<Boolean> alreadyParticipatedMono = userContestRepository.findByUserIdAndContestId(userId, contestId)
        .hasElement();

    return Mono.zip(contestMono, isCreatorMono, isAdminMono, alreadyParticipatedMono)
        .flatMap(tuple -> {
          Contest contest = tuple.getT1();
          Boolean isCreator = tuple.getT2();
          Boolean isAdmin = tuple.getT3();
          Boolean alreadyParticipated = tuple.getT4();

          // Check if user is creator or admin
          if (isCreator || isAdmin) {
            return Mono.error(new ForbiddenException("Contest creators and admins cannot participate in their own contests"));
          }

          // Check if already participated
          if (alreadyParticipated) {
            return Mono.error(new ForbiddenException("You have already joined this contest"));
          }

          // Check if contest has started
          LocalDateTime now = LocalDateTime.now();
          if (now.isBefore(contest.getStartTime())) {
            return Mono.error(new ForbiddenException("Contest has not started yet"));
          }

          // Check if contest has ended
          if (now.isAfter(contest.getEndTime())) {
            return Mono.error(new ForbiddenException("Contest has already ended"));
          }

          // Create participation record
          UserContest userContest = new UserContest(userId, contestId);
          return userContestRepository.save(userContest)
              .then(Mono.just(new ResponseEntity<>(null, "Successfully joined the contest")));
        });
  }
}