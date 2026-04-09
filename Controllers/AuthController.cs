using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HeptaStore.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HeptaStore.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public AuthController(UserManager<IdentityUser> userManager, IConfiguration config, IWebHostEnvironment env)
    {
        _userManager = userManager;
        _config = config;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var user = new IdentityUser { UserName = request.Email, Email = request.Email };
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        var role = request.IsManager ? "Manager" : "Customer";
        await _userManager.AddToRoleAsync(user, role);

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized("Invalid credentials.");

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwt(user, roles);
        AppendAuthCookie(token);

        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");
        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (user is null) return Unauthorized();
        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { user.Email, Role = roles.FirstOrDefault() ?? "Customer" });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (user is null) return Unauthorized();

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            user.UserName = request.Email;
            user.Email = request.Email;
            var emailResult = await _userManager.UpdateAsync(user);
            if (!emailResult.Succeeded)
                return BadRequest(emailResult.Errors.Select(e => e.Description));
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                return BadRequest("CurrentPassword is required to set a new password.");

            var passwordResult = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!passwordResult.Succeeded)
                return BadRequest(passwordResult.Errors.Select(e => e.Description));
        }

        return NoContent();
    }

    private string GenerateJwt(IdentityUser user, IList<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiresInMinutes"]!));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void AppendAuthCookie(string token)
    {
        var expires = DateTimeOffset.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiresInMinutes"]!));
        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = _env.IsProduction(),
            SameSite = SameSiteMode.Strict,
            Expires = expires,
        });
    }
}
