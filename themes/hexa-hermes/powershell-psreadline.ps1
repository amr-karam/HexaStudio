# HEXA Hermes PSReadLine options — signature gold on void.
# Opt-in: this file is dot-sourced by your PowerShell $PROFILE (created by the
# theme installer), or dot-source it manually from your own profile:
#   . "C:\Users\amrmo\OneDrive\Desktop\hexastudio.net\themes\hexa-hermes\powershell-psreadline.ps1"
# Revert: delete the $PROFILE line (or the whole $PROFILE if the installer
# created it) and restart the shell.

if (Get-Module -ListAvailable -Name PSReadLine) {
    Import-Module PSReadLine -ErrorAction SilentlyContinue
    Set-PSReadLineOption -PredictionViewStyle InlineView
    Set-PSReadLineOption -Colors @{
        # Ghost-text prediction — deep gold, stays out of the way.
        # (Key set verified against PSReadLine 2.4; `Prediction` is not a
        # valid Colors key there — InlinePrediction is.)
        InlinePrediction = '#A8862E'
        # Typed command line — bright gold command, soft-gray parameters.
        Command          = '#E5C76B'
        Parameter        = '#A0A0A0'
        Operator         = '#D4AF37'
    }
}
