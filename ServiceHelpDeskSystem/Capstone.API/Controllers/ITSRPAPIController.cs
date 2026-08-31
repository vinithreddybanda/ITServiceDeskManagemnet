using Capstone.DAL.Models;
using Capstone.DAL.Repository;
using Microsoft.AspNetCore.Mvc;

namespace Capstone.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ITSRPAPIController(IRepository repository) : ControllerBase
{
    [HttpGet("Authenticate")]
    public IActionResult Authenticate(string userName, string password)
    {
        var user = new User { UserName = userName, Password = password };
        if (!repository.Authenticate(user))
        {
            return NotFound("Invalid credentials");
        }

        var foundUser = repository.GetUser(userName);
        return Ok(foundUser);
    }

    [HttpGet("GetAllRequest")]
    public IActionResult GetAllRequest()
    {
        var requests = repository.ViewRequests();
        if (requests.Count == 0)
        {
            return NotFound("No requests found");
        }

        return Ok(requests);
    }

    [HttpGet("GetRequestsByUser")]
    public IActionResult GetRequestsByUser(string userName)
    {
        var requests = repository.ViewRequests(userName);
        if (requests.Count == 0)
        {
            return NotFound("No requests found");
        }

        return Ok(requests);
    }

    [HttpGet("GetRequestsBySP")]
    public IActionResult GetRequestsBySP(string userName)
    {
        var requests = repository.GetRequestBySP(userName);
        if (requests.Count == 0)
        {
            return NotFound("No requests found");
        }

        return Ok(requests);
    }

    [HttpPost("reopen")]
    public IActionResult ReOpenRequest([FromBody] ServiceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = repository.ReOpenRequest(request);
        if (!updated)
        {
            return NotFound("Request not found");
        }

        var refreshed = repository.GetRequestById(request.RequestId);
        return Ok(refreshed);
    }

    [HttpPost("CreateNewSeRequest")]
    public IActionResult Post([FromBody] ServiceRequest newRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var requestId = repository.RaiseRequest(newRequest);
        return CreatedAtAction(nameof(GetRequestsById), new { reqId = requestId }, new { RequestId = requestId });
    }

    [HttpGet("GetRequestById")]
    public IActionResult GetRequestsById(int reqId)
    {
        var request = repository.GetRequestById(reqId);
        if (request == null)
        {
            return NotFound("Request not found");
        }

        return Ok(request);
    }

    [HttpGet("GetUser")]
    public IActionResult GetUser(string userName)
    {
        var user = repository.GetUser(userName);
        if (user == null)
        {
            return NotFound("User does not exist");
        }

        return Ok(user);
    }

    [HttpGet("CloseRequest")]
    public IActionResult CloseRequest(int id)
    {
        var closed = repository.CloseRequest(id);
        if (!closed)
        {
            return NotFound("Request not found");
        }

        return Ok("Request closed successfully");
    }

    [HttpGet("Delete")]
    public IActionResult Delete(int id)
    {
        var deleted = repository.DeleteRequest(id);
        if (!deleted)
        {
            return NotFound("Request not found");
        }

        return Ok("Request deleted successfully");
    }
}