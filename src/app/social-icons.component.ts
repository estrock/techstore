import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-icons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="social-icons-container">
      <div class="social-icons">
        <a href="https://wa.me/521234567890" target="_blank" class="social-icon whatsapp" title="WhatsApp">
          <i class="bi bi-whatsapp"></i>
        </a>
        <a href="https://www.facebook.com" target="_blank" class="social-icon facebook" title="Facebook">
          <i class="bi bi-facebook"></i>
        </a>
        <a href="https://www.instagram.com" target="_blank" class="social-icon instagram" title="Instagram">
          <i class="bi bi-instagram"></i>
        </a>
        <a href="https://twitter.com" target="_blank" class="social-icon twitter" title="Twitter">
          <i class="bi bi-twitter"></i>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .social-icons-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .social-icons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .social-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      
      i {
        font-size: 24px;
        color: white;
      }
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }
    }

    .whatsapp {
      background: linear-gradient(135deg, #25d366, #128c7e);
    }

    .facebook {
      background: linear-gradient(135deg, #1877f2, #0d5bb5);
    }

    .instagram {
      background: linear-gradient(135deg, #e4405f, #c13584, #833ab4, #5851db, #405de6);
    }

    .twitter {
      background: linear-gradient(135deg, #1da1f2, #0d8bd9);
    }

    @media (max-width: 768px) {
      .social-icons-container {
        bottom: 15px;
        right: 15px;
      }
      
      .social-icon {
        width: 45px;
        height: 45px;
        
        i {
          font-size: 20px;
        }
      }
    }
  `]
})
export class SocialIconsComponent {}