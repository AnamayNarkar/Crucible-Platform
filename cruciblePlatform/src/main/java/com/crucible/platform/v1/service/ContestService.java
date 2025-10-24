package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import com.crucible.platform.v1.dto.contest.CreateContest;
import com.crucible.platform.v1.dto.contest.UpdateContest;
import com.crucible.platform.v1.dto.contest.ManageContestResponse;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.user.UserSummaryDto;
import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.entity.ContestAdmin;
import com.crucible.platform.v1.exceptions.ForbiddenException;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.exceptions.UnauthorizedAccessException;
import com.crucible.platform.v1.repository.ContestAdminRepository;
import com.crucible.platform.v1.repository.ContestRepository;
import com.crucible.platform.v1.repository.QuestionRepository;
import com.crucible.platform.v1.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContestService {
  private final ContestRepository contestRepository;
  private final ContestAdminRepository contestAdminRepository;
  private final QuestionRepository questionRepository;
  private final UserRepository userRepository;

  public ContestService(ContestRepository contestRepository,
      ContestAdminRepository contestAdminRepository, QuestionRepository questionRepository,
      UserRepository userRepository) {
    this.contestAdminRepository = contestAdminRepository;
    this.contestRepository = contestRepository;
    this.questionRepository = questionRepository;
    this.userRepository = userRepository;
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
}