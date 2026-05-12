// 첫 관리자를 만들기 위한 일회성 스크립트
// 사용법: node scripts/makeAdmin.js your@email.com
//
// 또는 MongoDB Atlas에서 직접:
// users 컬렉션 → 자기 계정 찾기 → role 필드를 "admin"으로 수정

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const email = process.argv[2];
if (!email) {
  console.error('❌ 이메일을 입력하세요: node scripts/makeAdmin.js your@email.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ 유저를 찾을 수 없습니다: ${email}`);
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`✓ ${user.username} (${email}) → 관리자 권한 부여 완료`);
    process.exit(0);
  })
  .catch(err => {
    console.error('에러:', err);
    process.exit(1);
  });
