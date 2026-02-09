package com.pickmeup.service.notification;

import com.pickmeup.domain.recruiter.ContactProposal;

/**
 * 이메일 템플릿
 */
public class EmailTemplates {

    /**
     * 제안 이메일 HTML
     */
    public static String buildProposalEmail(ContactProposal proposal, String acceptUrl, String rejectUrl) {
        return String.format("""
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>면접 제안이 도착했어요!</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">💼 면접 제안이 도착했어요!</h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h2 style="margin: 0 0 20px 0; color: #1f2937;">%s에서 연락이 왔습니다</h2>
                                            
                                            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
                                                <table style="width: 100%%;">
                                                    <tr>
                                                        <td style="padding: 10px; color: #6b7280; width: 100px;">포지션</td>
                                                        <td style="padding: 10px; font-weight: 600;">%s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px; color: #6b7280;">급여</td>
                                                        <td style="padding: 10px; font-weight: 600;">%s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px; color: #6b7280;">근무지</td>
                                                        <td style="padding: 10px; font-weight: 600;">%s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px; color: #6b7280;">고용형태</td>
                                                        <td style="padding: 10px; font-weight: 600;">%s</td>
                                                    </tr>
                                                </table>
                                            </div>
                                            
                                            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #1f2937;">%s</p>
                                            </div>
                                            
                                            <!-- Buttons -->
                                            <div style="text-align: center; margin-top: 30px;">
                                                <a href="%s" 
                                                   style="display: inline-block; padding: 14px 32px; 
                                                          background: #10b981; color: white; text-decoration: none; 
                                                          border-radius: 6px; font-weight: 600; margin: 0 10px;">
                                                    ✅ 관심있어요
                                                </a>
                                                <a href="%s" 
                                                   style="display: inline-block; padding: 14px 32px; 
                                                          background: #ef4444; color: white; text-decoration: none; 
                                                          border-radius: 6px; font-weight: 600; margin: 0 10px;">
                                                    ❌ 거절하기
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">
                                                이 제안은 30일간 유효합니다
                                            </p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                                © 2025 PickMeUp. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """,
                proposal.getCompanyName(),
                proposal.getPosition(),
                proposal.getSalaryRange() != null ? proposal.getSalaryRange() : "협의 가능",
                proposal.getLocation() != null ? proposal.getLocation() : "미정",
                proposal.getWorkType() != null ? proposal.getWorkType() : "정규직",
                proposal.getMessage().replace("<", "&lt;").replace(">", "&gt;"),
                acceptUrl,
                rejectUrl
        );
    }
    
    /**
     * 제안 수락 알림 (헤드헌터에게)
     */
    public static String buildProposalAcceptedEmail(ContactProposal proposal, String chatUrl) {
        return String.format("""
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>지원자가 관심을 보였습니다!</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: white; font-size: 28px;">🎉 제안이 수락되었습니다!</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 40px;">
                                            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                                                <strong>%s</strong>님이 
                                                <strong>%s</strong> 포지션 제안을 수락했습니다.
                                            </p>
                                            
                                            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                                <p style="margin: 0;">
                                                    이제 1:1 채팅을 통해 상세한 면접 일정을 조율하실 수 있습니다.
                                                </p>
                                            </div>
                                            
                                            <div style="text-align: center; margin-top: 30px;">
                                                <a href="%s" 
                                                   style="display: inline-block; padding: 14px 32px; 
                                                          background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                                                          color: white; text-decoration: none; 
                                                          border-radius: 6px; font-weight: 600;">
                                                    💬 채팅 시작하기
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """,
                proposal.getJobSeeker().getName(),
                proposal.getPosition(),
                chatUrl
        );
    }
}
