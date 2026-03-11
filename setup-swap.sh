#!/bin/bash

# สคริปต์สร้าง Swap File 2GB สำหรับ DigitalOcean Droplet
echo "🚀 เริ่มต้นการสร้าง Swap File ขนาด 2GB..."

# 1. สร้างไฟล์เปล่าขนาด 2GB
sudo fallocate -l 2G /swapfile
echo "✅ สร้างไฟล์ /swapfile เรียบร้อย"

# 2. จำกัดสิทธิ์ให้ระบบเข้าถึงได้เท่านั้น
sudo chmod 600 /swapfile
echo "✅ กำหนดสิทธิ์ความปลอดภัย 600 เรียบร้อย"

# 3. จัดฟอร์แมตไฟล์ให้กลายเป็น Swap
sudo mkswap /swapfile
echo "✅ จัดฟอร์แมตไฟล์ให้เป็นระบบ Swap เรียบร้อย"

# 4. เปิดใช้งาน Swap
sudo swapon /swapfile
echo "✅ เปิดการใช้งาน Swap แล้ว (ตรวจเช็คด้วยคำสั่ง 'free -h')"

# 5. ทำให้ Swap เปิดใช้งานถาวรแม้สคริปต์หยุดทำงาน (แก้ไข /etc/fstab)
# ตรวจสอบว่ามีข้อมูล /swapfile อยู่ใน fstab หรือยัง ถ้ายังให้เติมลงไป
if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ บันทึก Swap File ลงใน /etc/fstab เพื่อให้ทำงานตอนเปิดเครื่องใหม่เรียบร้อย"
else
    echo "ℹ️ พบการตั้งค่า /swapfile ใน /etc/fstab อยู่แล้ว ข้ามการบันทึก"
fi

echo "🎉 เปิดใช้งาน Swap File 2GB เรียบร้อย! ตอนนี้ระบบของคุณพร้อมสำหรับ Docker Build แล้ว"
