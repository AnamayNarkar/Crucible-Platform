package com.crucible.platform.v1.dto.contest;

import com.crucible.platform.v1.dto.user.UserSummaryDto;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.entity.Question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ManageContestResponse {
    Contest contest;
    UserSummaryDto[] admins;
    Question[] questions;
}
