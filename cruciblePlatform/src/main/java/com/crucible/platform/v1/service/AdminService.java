package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.admin.AlterAdminDto;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.entity.ContestAdmin;
import com.crucible.platform.v1.entity.User;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.exceptions.UnauthorizedAccessException;
import com.crucible.platform.v1.repository.ContestAdminRepository;
import com.crucible.platform.v1.repository.ContestRepository;
import com.crucible.platform.v1.repository.UserRepository;

@Service
public class AdminService {
    private final ContestRepository contestRepository;
    private final ContestAdminRepository contestAdminRepository;
    private final UserRepository userRepository;

    public AdminService(ContestRepository contestRepository, ContestAdminRepository contestAdminRepository, UserRepository userRepository) {
        this.contestRepository = contestRepository;
        this.contestAdminRepository = contestAdminRepository;
        this.userRepository = userRepository;
    }

    public Mono<ResponseEntity<Void>> createAdmin(WebSession session, AlterAdminDto dto) {
        Long userId = (Long) session.getAttributes().get("userId");
        Long contestId = dto.getContestId();
        String email = dto.getEmail();

        // Fetch contest
        Mono<Contest> contestMono = contestRepository.findById(contestId)
            .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")));

        // Fetch user to add
        Mono<User> userMono = userRepository.findByEmail(email)
            .switchIfEmpty(Mono.error(new NotFoundException("User not found with email: " + email)));

        return Mono.zip(contestMono, userMono)
            .flatMap(tuple -> {
                Contest contest = tuple.getT1();
                User user = tuple.getT2();

                boolean isCreator = contest.getCreatorId().equals(userId);

                if (!isCreator) {
                    return Mono.error(new UnauthorizedAccessException("Only contest creators can add admins"));
                }

                ContestAdmin ca = new ContestAdmin(contestId, user.getId());
                return contestAdminRepository.save(ca)
                    .map(saved -> new ResponseEntity<>(null, "Admin added successfully"));
            });
    }

    public Mono<ResponseEntity<Void>> deleteAdmin(WebSession session, AlterAdminDto dto) {
        Long userId = (Long) session.getAttributes().get("userId");
        Long contestId = dto.getContestId();
        String email = dto.getEmail();

        // Fetch contest
        Mono<Contest> contestMono = contestRepository.findById(contestId)
            .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")));

        // Fetch user to remove
        Mono<User> userMono = userRepository.findByEmail(email)
            .switchIfEmpty(Mono.error(new NotFoundException("User not found with email: " + email)));

        return Mono.zip(contestMono, userMono)
            .flatMap(tuple -> {
                Contest contest = tuple.getT1();
                User user = tuple.getT2();

                boolean isCreator = contest.getCreatorId().equals(userId);

                if (!isCreator) {
                    return Mono.error(new UnauthorizedAccessException("Only contest creators can delete admins"));
                }

                return contestAdminRepository.deleteByContestIdAndAdminId(contestId, user.getId())
                    .then(Mono.just(new ResponseEntity<Void>(null, "Admin removed successfully")));
            });
    }
}
