'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../../../store/formStore';
import { Toggle, Checkbox } from '../../ui';
import { StepHeader } from '../StepHeader';
import styles from './NotificationsStep.module.css';

interface NotificationsStepProps {
  locale?: string;
}

export interface NotificationsStepRef {
  save: () => Promise<boolean>;
  isValid: () => boolean;
}

interface ConfirmationDialog {
  isOpen: boolean;
  type: 'email' | 'phone' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const NotificationsStep = forwardRef<NotificationsStepRef, NotificationsStepProps>(
  ({ locale = 'en' }, ref) => {
    const { formData, updateNotifications, saveCurrentStep } = useFormStore();
    const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
      isOpen: false,
      type: null,
      onConfirm: () => {},
      onCancel: () => {},
    });

    // Handle Email Toggle with confirmation
    const handleEmailToggle = (checked: boolean) => {
      if (!checked && formData.notifications.email) {
        // Show confirmation dialog when turning OFF
        setConfirmDialog({
          isOpen: true,
          type: 'email',
          onConfirm: () => {
            updateNotifications({ email: false });
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
          onCancel: () => {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
        });
      } else {
        // Turn ON immediately (optimistic update)
        updateNotifications({ email: checked });
      }
    };

    // Handle Phone Toggle with complex logic
    const handlePhoneToggle = (checked: boolean) => {
      if (!checked && formData.notifications.phone) {
        // Show confirmation dialog when turning OFF
        setConfirmDialog({
          isOpen: true,
          type: 'phone',
          onConfirm: () => {
            // Turn OFF phone and ALL sub-checkboxes
            updateNotifications({
              phone: false,
              call: false,
              sms: false,
              whatsapp: false,
            });
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
          onCancel: () => {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
        });
      } else if (checked) {
        // Turn ON phone and ALL sub-checkboxes (optimistic update)
        updateNotifications({
          phone: true,
          call: true,
          sms: true,
          whatsapp: true,
        });

        // Scroll to show the new sub-options after animation
        setTimeout(() => {
          const subOptionsElement = document.querySelector(`.${styles.subOptions}`);
          if (subOptionsElement) {
            subOptionsElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }, 100); // Wait for animation to complete
      }
    };

    // Handle Sub-checkbox changes
    const handleSubCheckboxChange = (type: 'call' | 'sms' | 'whatsapp', checked: boolean) => {
      const newNotifications = {
        ...formData.notifications,
        [type]: checked,
      };

      // Check if ALL sub-checkboxes will be unchecked
      const allSubsUnchecked =
        !newNotifications.call && !newNotifications.sms && !newNotifications.whatsapp;

      if (allSubsUnchecked) {
        // If all subs are unchecked, turn OFF phone toggle too
        updateNotifications({
          [type]: checked,
          phone: false,
        });
      } else {
        updateNotifications({ [type]: checked });
      }
    };

    // Expose save and isValid methods to parent component
    useImperativeHandle(ref, () => ({
      save: async (): Promise<boolean> => {
        try {
          console.log(
            '🟣 NotificationsStep: Saving notification preferences:',
            formData.notifications,
          );

          // The notifications are already updated in the store via updateNotifications
          // So we just need to save the current state to the server
          const success = await saveCurrentStep();
          console.log('🟣 NotificationsStep: Save result:', success);
          return success;
        } catch (error) {
          console.error('❌ NotificationsStep: Error saving:', error);
          return false;
        }
      },
      isValid: (): boolean => {
        // For notifications step, we can consider it always valid since notifications are optional
        // But we could require at least one notification method if needed
        const hasAnyNotification = formData.notifications.email || formData.notifications.phone;
        console.log('🔍 NotificationsStep: Has any notification enabled:', hasAnyNotification);

        // For now, let's make it always valid (notifications are optional)
        return true;
      },
    }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.container}
      >
        <StepHeader
          title="Notification Preferences"
          subtitle="Choose how you'd like to receive updates about your application"
        />

        <div className={styles.notificationsList}>
          {/* Email Toggle */}
          <div className={styles.notificationItem}>
            <div className={styles.itemHeader}>
              <span className={styles.icon}>📧</span>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemTitle}>Email Notifications</h4>
                <p className={styles.itemDescription}>Receive job alerts and updates via email</p>
              </div>
              <Toggle
                label=""
                checked={formData.notifications.email}
                onToggle={handleEmailToggle}
              />
            </div>
          </div>

          {/* Phone Toggle with Sub-checkboxes */}
          <div className={styles.notificationItem}>
            <div className={styles.itemHeader}>
              <span className={styles.icon}>📱</span>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemTitle}>Phone Notifications</h4>
                <p className={styles.itemDescription}>Receive notifications via phone</p>
              </div>
              <Toggle
                label=""
                checked={formData.notifications.phone}
                onToggle={handlePhoneToggle}
              />
            </div>

            {/* Sub-checkboxes - Only visible when Phone is ON */}
            <AnimatePresence>
              {formData.notifications.phone && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    height: { duration: 0.3 },
                  }}
                  className={styles.subOptions}
                >
                  <div
                    className={`${styles.subOption} ${
                      formData.notifications.call ? styles.checked : ''
                    }`}
                  >
                    <span className={styles.subOptionIcon}>📞</span>
                    <div className={styles.subOptionContent}>
                      <Checkbox
                        label="Voice Calls"
                        checked={formData.notifications.call}
                        onChange={(checked) => handleSubCheckboxChange('call', checked)}
                      />
                      <div className={styles.subOptionHint}>
                        Receive important updates via phone calls
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.subOption} ${
                      formData.notifications.sms ? styles.checked : ''
                    }`}
                  >
                    <span className={styles.subOptionIcon}>💬</span>
                    <div className={styles.subOptionContent}>
                      <Checkbox
                        label="SMS Messages"
                        checked={formData.notifications.sms}
                        onChange={(checked) => handleSubCheckboxChange('sms', checked)}
                      />
                      <div className={styles.subOptionHint}>
                        Get quick updates via text messages
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.subOption} ${
                      formData.notifications.whatsapp ? styles.checked : ''
                    }`}
                  >
                    <span className={styles.subOptionIcon}>📲</span>
                    <div className={styles.subOptionContent}>
                      <Checkbox
                        label="WhatsApp"
                        checked={formData.notifications.whatsapp}
                        onChange={(checked) => handleSubCheckboxChange('whatsapp', checked)}
                      />
                      <div className={styles.subOptionHint}>Receive notifications on WhatsApp</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className={styles.dialogBackdrop} onClick={confirmDialog.onCancel}>
            <motion.div
              className={styles.dialog}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.dialogHeader}>
                <h3>Disable {confirmDialog.type === 'email' ? 'Email' : 'Phone'} Notifications?</h3>
                <button onClick={confirmDialog.onCancel} className={styles.closeButton}>
                  ×
                </button>
              </div>

              <div className={styles.dialogContent}>
                <p>
                  Are you sure you want to disable{' '}
                  {confirmDialog.type === 'email' ? 'email' : 'phone'} notifications?
                </p>
              </div>

              <div className={styles.dialogActions}>
                <button onClick={confirmDialog.onCancel} className={styles.cancelButton}>
                  No, stay
                </button>
                <button onClick={confirmDialog.onConfirm} className={styles.confirmButton}>
                  Yes, remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  },
);

NotificationsStep.displayName = 'NotificationsStep';
